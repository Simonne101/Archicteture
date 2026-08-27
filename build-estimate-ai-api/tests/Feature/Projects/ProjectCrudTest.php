<?php

namespace Tests\Feature\Projects;

use App\Models\Project;
use App\Models\User;
use App\Services\OrganizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_member_can_create_a_project_in_their_organization(): void
    {
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'organization_id' => $organization->id,
            'name' => 'Villa Almadies',
            'description' => 'Maison R+1 avec terrasse',
            'location' => 'Dakar',
            'country_code' => 'BJ',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Villa Almadies')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.currency', config('build_estimate.default_currency'));

        $this->assertDatabaseHas('projects', [
            'organization_id' => $organization->id,
            'created_by' => $user->id,
            'name' => 'Villa Almadies',
        ]);
    }

    public function test_a_project_can_be_created_without_specifying_an_organization(): void
    {
        // The frontend never surfaces "organization" — omitting
        // organization_id must fall back to the user's own.
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Villa Almadies',
            'country_code' => 'BJ',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.organization_id', $organization->id);
    }

    public function test_creating_a_project_requires_a_name(): void
    {
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'organization_id' => $organization->id,
            'country_code' => 'BJ',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_a_member_can_update_a_project_in_their_organization(): void
    {
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = Project::factory()->create([
            'organization_id' => $organization->id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->patchJson("/api/v1/projects/{$project->id}", [
            'name' => 'Villa Almadies — v2',
        ]);

        $response->assertStatus(200)->assertJsonPath('data.name', 'Villa Almadies — v2');
    }

    public function test_status_cannot_be_set_directly_by_the_client(): void
    {
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = Project::factory()->create([
            'organization_id' => $organization->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->patchJson("/api/v1/projects/{$project->id}", [
            'status' => 'completed',
        ])->assertStatus(200);

        $this->assertSame('draft', $project->fresh()->status->value);
    }

    public function test_an_owner_can_delete_a_project(): void
    {
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = Project::factory()->create([
            'organization_id' => $organization->id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/v1/projects/{$project->id}");

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }
}
