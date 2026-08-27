<?php

namespace Tests\Feature\Subscriptions;

use App\Enums\OrganizationRole;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\OrganizationService;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private function makeOrganization(User $owner): Organization
    {
        return app(OrganizationService::class)->create(['name' => 'Cabinet A'], $owner);
    }

    public function test_anyone_can_list_the_public_subscription_plans(): void
    {
        $this->seed(SubscriptionPlanSeeder::class);

        $response = $this->getJson('/api/v1/subscription-plans');

        $response->assertStatus(200);
        $this->assertSame(['free', 'pro', 'business'], collect($response->json('data'))->pluck('slug')->all());
    }

    public function test_an_organization_with_no_subscription_is_on_the_free_plan_by_default(): void
    {
        $this->seed(SubscriptionPlanSeeder::class);

        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);

        $response = $this->actingAs($owner)->getJson("/api/v1/organizations/{$organization->id}/subscription");

        $response->assertStatus(200)
            ->assertJsonPath('data.subscription', null)
            ->assertJsonPath('data.usage.plan.slug', 'free');
    }

    public function test_an_owner_can_subscribe_the_organization_to_a_plan(): void
    {
        $this->seed(SubscriptionPlanSeeder::class);

        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);
        $plan = SubscriptionPlan::where('slug', 'pro')->firstOrFail();

        $response = $this->actingAs($owner)->postJson("/api/v1/organizations/{$organization->id}/subscription", [
            'subscription_plan_id' => $plan->id,
            'billing_interval' => 'monthly',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.subscription.status', 'active')
            ->assertJsonPath('data.subscription.plan.slug', 'pro');

        $this->assertDatabaseHas('subscriptions', [
            'organization_id' => $organization->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
        ]);
    }

    public function test_a_member_cannot_manage_billing(): void
    {
        $this->seed(SubscriptionPlanSeeder::class);

        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);
        $plan = SubscriptionPlan::where('slug', 'pro')->firstOrFail();

        $member = User::factory()->create();
        $organization->users()->attach($member->id, ['role' => OrganizationRole::Member->value]);

        $this->actingAs($member)
            ->postJson("/api/v1/organizations/{$organization->id}/subscription", [
                'subscription_plan_id' => $plan->id,
            ])
            ->assertStatus(403);
    }

    public function test_an_owner_can_cancel_the_subscription(): void
    {
        $this->seed(SubscriptionPlanSeeder::class);

        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);
        $plan = SubscriptionPlan::where('slug', 'pro')->firstOrFail();

        $this->actingAs($owner)->postJson("/api/v1/organizations/{$organization->id}/subscription", [
            'subscription_plan_id' => $plan->id,
        ]);

        $response = $this->actingAs($owner)->postJson("/api/v1/organizations/{$organization->id}/subscription/cancel");

        $response->assertStatus(200)->assertJsonPath('data.cancel_at_period_end', true);
    }

    public function test_a_guest_cannot_view_a_subscription(): void
    {
        $this->seed(SubscriptionPlanSeeder::class);

        $owner = User::factory()->create();
        $organization = $this->makeOrganization($owner);

        $this->getJson("/api/v1/organizations/{$organization->id}/subscription")->assertStatus(401);
    }
}
