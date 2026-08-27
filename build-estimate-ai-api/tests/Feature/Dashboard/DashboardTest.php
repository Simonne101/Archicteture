<?php

namespace Tests\Feature\Dashboard;

use App\Models\Organization;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function makeOrganization(User $owner): Organization
    {
        return app(OrganizationService::class)->create(['name' => 'Cabinet A'], $owner);
    }

    public function test_the_dashboard_reports_counts_and_recent_activity_for_the_organization(): void
    {
        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);

        app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $owner);
        app(ProjectService::class)->create(['name' => 'Immeuble Plateau'], $organization, $owner);

        $response = $this->actingAs($owner)->getJson("/api/v1/organizations/{$organization->id}/dashboard");

        $response->assertStatus(200)
            ->assertJsonPath('data.projects_count', 2)
            ->assertJsonPath('data.plans_count', 0)
            ->assertJsonPath('data.estimates_count', 0)
            ->assertJsonCount(2, 'data.recent_projects')
            ->assertJsonPath('data.usage.plan.slug', 'unconfigured');
    }

    public function test_a_user_outside_the_organization_cannot_view_its_dashboard(): void
    {
        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->getJson("/api/v1/organizations/{$organization->id}/dashboard")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_view_a_dashboard(): void
    {
        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);

        $this->getJson("/api/v1/organizations/{$organization->id}/dashboard")->assertStatus(401);
    }
}
