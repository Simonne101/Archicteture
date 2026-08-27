<?php

namespace Tests\Feature\Organizations;

use App\Models\User;
use App\Services\OrganizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_an_organization_and_becomes_its_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/organizations', [
            'name' => 'Cabinet Architecture Dupont',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Cabinet Architecture Dupont')
            ->assertJsonPath('data.is_owner', true)
            ->assertJsonPath('data.role', 'owner');

        $this->assertDatabaseHas('organization_user', [
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
    }

    public function test_a_user_can_view_an_organization_they_belong_to(): void
    {
        $owner = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Org A'], $owner);

        $response = $this->actingAs($owner)->getJson("/api/v1/organizations/{$organization->id}");

        $response->assertStatus(200)->assertJsonPath('data.id', $organization->id);
    }

    public function test_a_user_cannot_view_an_organization_they_do_not_belong_to(): void
    {
        $owner = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Org A'], $owner);

        $outsider = User::factory()->create();

        $response = $this->actingAs($outsider)->getJson("/api/v1/organizations/{$organization->id}");

        $response->assertStatus(403)->assertJsonPath('success', false);
    }

    public function test_a_guest_cannot_list_organizations(): void
    {
        $response = $this->getJson('/api/v1/organizations');

        $response->assertStatus(401);
    }

    public function test_listing_organizations_only_returns_the_users_own_organizations(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $service = app(OrganizationService::class);
        $orgA = $service->create(['name' => 'Org A'], $userA);
        $service->create(['name' => 'Org B'], $userB);

        $response = $this->actingAs($userA)->getJson('/api/v1/organizations');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $orgA->id)
            ->assertJsonPath('data.meta.total', 1);
    }
}
