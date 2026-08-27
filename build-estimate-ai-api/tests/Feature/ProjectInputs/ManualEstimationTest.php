<?php

namespace Tests\Feature\ProjectInputs;

use App\Models\Project;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Database\Seeders\MaterialSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ManualEstimationTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(User $user): Project
    {
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        return app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
    }

    public function test_a_confirmed_analysis_can_be_derived_from_the_form_alone_and_estimated(): void
    {
        $this->seed(MaterialSeeder::class);
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'dimensions' => ['building_length' => 12, 'building_width' => 10],
            'structure' => ['levels' => 1],
            'walls' => ['height' => 3, 'thickness' => 0.2],
        ])->assertStatus(200);

        $response = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/input/analyze");

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.provider', 'manual')
            ->assertJsonPath('data.is_confirmed', true)
            ->assertJsonCount(1, 'data.measurements');

        $analysisId = $response->json('data.id');

        // The estimation pipeline is completely unaware this didn't come
        // from an uploaded plan — same endpoint, same async job.
        $estimate = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/estimates", [
            'analysis_id' => $analysisId,
        ]);

        $estimate->assertStatus(202);

        $show = $this->getJson("/api/v1/estimates/{$estimate->json('data.id')}");
        $show->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.certified', false);

        $items = $show->json('data.items');
        $this->assertNotEmpty($items);
        $this->assertGreaterThan(0, $items[0]['quantity']);
    }

    public function test_it_is_rejected_when_the_form_lacks_the_minimum_data(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
            'dimensions' => ['approximate_surface' => 100],
            // No wall height/thickness at all — nothing to derive a volume from.
        ])->assertStatus(200);

        $this->actingAs($user)
            ->postJson("/api/v1/projects/{$project->id}/input/analyze")
            ->assertStatus(422);
    }

    public function test_it_is_rejected_when_no_input_was_ever_saved(): void
    {
        $user = User::factory()->create();
        $project = $this->makeProject($user);

        $this->actingAs($user)
            ->postJson("/api/v1/projects/{$project->id}/input/analyze")
            ->assertStatus(422);
    }

    public function test_a_user_outside_the_organization_cannot_trigger_a_manual_analysis(): void
    {
        $owner = User::factory()->create();
        $project = $this->makeProject($owner);

        $this->actingAs($owner)->putJson("/api/v1/projects/{$project->id}/input", [
            'dimensions' => ['building_length' => 12, 'building_width' => 10],
            'walls' => ['height' => 3, 'thickness' => 0.2],
        ]);

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->postJson("/api/v1/projects/{$project->id}/input/analyze")
            ->assertStatus(403);
    }
}
