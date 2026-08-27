<?php

namespace Tests\Feature\Usage;

use App\Enums\SubscriptionStatus;
use App\Models\Project;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UsageLimitTest extends TestCase
{
    use RefreshDatabase;

    private function makeProjectOnPlan(User $user, array $limits): Project
    {
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $plan = SubscriptionPlan::factory()->create(['limits' => $limits]);
        Subscription::factory()->create([
            'organization_id' => $organization->id,
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::Active,
        ]);

        return app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
    }

    public function test_uploading_beyond_the_plans_monthly_limit_is_rejected(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProjectOnPlan($user, [
            'plans_per_month' => 1,
            'storage_mb' => 200,
        ]);

        $ok = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => UploadedFile::fake()->create('plan-1.pdf', 100, 'application/pdf'),
        ]);
        $ok->assertStatus(201);

        $blocked = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => UploadedFile::fake()->create('plan-2.pdf', 100, 'application/pdf'),
        ]);
        $blocked->assertStatus(402)->assertJsonPath('success', false);

        $this->assertDatabaseCount('plans', 1);
    }

    public function test_uploading_beyond_the_plans_storage_limit_is_rejected(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProjectOnPlan($user, [
            'plans_per_month' => 10,
            'storage_mb' => 1,
        ]);

        $response = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => UploadedFile::fake()->create('huge-plan.pdf', 5000, 'application/pdf'),
        ]);

        $response->assertStatus(402)->assertJsonPath('success', false);
        $this->assertDatabaseCount('plans', 0);
    }

    public function test_a_null_limit_means_unlimited(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProjectOnPlan($user, [
            'plans_per_month' => null,
            'storage_mb' => null,
        ]);

        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
                'file' => UploadedFile::fake()->create("plan-{$i}.pdf", 100, 'application/pdf'),
            ])->assertStatus(201);
        }

        $this->assertDatabaseCount('plans', 3);
    }

    public function test_without_any_seeded_plan_usage_limits_fail_open(): void
    {
        // No SubscriptionPlanSeeder call, no subscription — mirrors every
        // other feature test in this suite, which never seeds billing data.
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);

        $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => UploadedFile::fake()->create('plan.pdf', 100, 'application/pdf'),
        ])->assertStatus(201);
    }
}
