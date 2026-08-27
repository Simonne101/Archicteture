<?php

namespace Tests\Feature\ProjectInputs;

use App\Models\Project;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Database\Seeders\MaterialSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectInputTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(User $user): Project
    {
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        return app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
    }

    public function test_a_project_with_no_saved_input_yet_returns_an_empty_but_valid_resource(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $response = $this->actingAs($user)->getJson("/api/v1/projects/{$project->id}/input");

        $response->assertStatus(200)
            ->assertJsonPath('data.project_id', $project->id)
            ->assertJsonPath('data.can_estimate', false)
            ->assertJsonPath('data.missing_fields', [
                'dimensions.approximate_surface',
                'structure.levels',
                'walls.height',
            ]);

        $this->assertDatabaseCount('project_inputs', 0);
    }

    public function test_a_member_can_save_project_input_sections_incrementally(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $first = $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'dimensions' => ['approximate_surface' => 180.5, 'building_length' => 12, 'building_width' => 15],
        ]);
        $first->assertStatus(200)->assertJsonPath('data.dimensions.approximate_surface', 180.5);

        // A second, partial update must not erase the first section.
        $second = $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'structure' => ['levels' => 2, 'ceiling_height' => 3],
        ]);

        $second->assertStatus(200)
            ->assertJsonPath('data.dimensions.approximate_surface', 180.5)
            ->assertJsonPath('data.structure.levels', 2);

        $this->assertDatabaseCount('project_inputs', 1);
    }

    public function test_saving_a_negative_surface_is_rejected(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'dimensions' => ['approximate_surface' => -10],
        ])->assertStatus(422);
    }

    public function test_saving_a_zero_level_count_is_rejected(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'structure' => ['levels' => 0],
        ])->assertStatus(422);
    }

    public function test_an_unknown_material_code_is_rejected(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'materials' => [['material_code' => 'does-not-exist']],
        ])->assertStatus(422);
    }

    public function test_a_known_material_code_is_accepted(): void
    {
        $this->seed(MaterialSeeder::class);
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'materials' => [['material_code' => 'ciment']],
        ])->assertStatus(200)->assertJsonPath('data.materials.0.material_code', 'ciment');
    }

    public function test_the_form_becomes_estimation_ready_once_the_minimum_fields_are_present(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $response = $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'dimensions' => ['approximate_surface' => 180.5],
            'structure' => ['levels' => 2],
            'walls' => ['height' => 3, 'thickness' => 0.2],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.can_estimate', true)
            ->assertJsonPath('data.missing_fields', []);
    }

    public function test_a_user_outside_the_organization_cannot_view_or_edit_project_input(): void
    {
        $owner = User::factory()->create();
        $project = $this->makeProject($owner);

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->getJson("/api/v1/projects/{$project->id}/input")
            ->assertStatus(403);

        $this->actingAs($outsider)
            ->putJson("/api/v1/projects/{$project->id}/input", ['dimensions' => ['approximate_surface' => 100]])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_view_project_input(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->getJson("/api/v1/projects/{$project->id}/input")->assertStatus(401);
    }
}
