<?php

namespace Tests\Feature\Projects;

use App\Enums\OrganizationRole;
use App\Models\Project;
use App\Models\User;
use App\Services\OrganizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_cannot_access_projects(): void
    {
        $this->getJson('/api/v1/projects')->assertStatus(401);
        $this->postJson('/api/v1/projects', [])->assertStatus(401);
    }

    public function test_a_user_cannot_view_a_project_from_an_organization_they_do_not_belong_to(): void
    {
        $owner = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $owner);
        $project = Project::factory()->create([
            'organization_id' => $organization->id,
            'created_by' => $owner->id,
        ]);

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->getJson("/api/v1/projects/{$project->id}")
            ->assertStatus(403);
    }

    public function test_a_user_cannot_create_a_project_in_an_organization_they_do_not_belong_to(): void
    {
        $owner = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $owner);

        $outsider = User::factory()->create();

        $this->actingAs($outsider)->postJson('/api/v1/projects', [
            'organization_id' => $organization->id,
            'name' => 'Projet non autorisé',
            'country_code' => 'BJ',
        ])->assertStatus(403);
    }

    public function test_a_viewer_cannot_update_or_delete_a_project(): void
    {
        $owner = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $owner);
        $project = Project::factory()->create([
            'organization_id' => $organization->id,
            'created_by' => $owner->id,
        ]);

        $viewer = User::factory()->create();
        $organization->users()->attach($viewer->id, ['role' => OrganizationRole::Viewer->value]);

        $this->actingAs($viewer)
            ->patchJson("/api/v1/projects/{$project->id}", ['name' => 'Tentative'])
            ->assertStatus(403);

        $this->actingAs($viewer)
            ->deleteJson("/api/v1/projects/{$project->id}")
            ->assertStatus(403);
    }

    public function test_listing_projects_only_returns_projects_from_the_users_organizations(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $orgService = app(OrganizationService::class);
        $orgA = $orgService->create(['name' => 'Cabinet A'], $userA);
        $orgB = $orgService->create(['name' => 'Cabinet B'], $userB);

        $projectA = Project::factory()->create(['organization_id' => $orgA->id, 'created_by' => $userA->id]);
        Project::factory()->create(['organization_id' => $orgB->id, 'created_by' => $userB->id]);

        $response = $this->actingAs($userA)->getJson('/api/v1/projects');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $projectA->id);
    }
}
