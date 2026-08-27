<?php

namespace Tests\Feature\Usage;

use App\Enums\AccountType;
use App\Enums\SubscriptionStatus;
use App\Models\Project;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\PlanService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnalysisAccessTest extends TestCase
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

    public function test_a_demo_account_is_reported_as_unlimited_never_with_a_fake_remaining_count(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['account_type' => AccountType::Demo])->save();
        $project = $this->makeProjectOnPlan($user, ['analyses_per_month' => 3]);

        $response = $this->actingAs($user)->getJson("/api/v1/projects/{$project->id}/analysis-access");

        $response->assertStatus(200)
            ->assertJsonPath('data.account_type', 'demo')
            ->assertJsonPath('data.analysis.allowed', true)
            ->assertJsonPath('data.analysis.unlimited', true)
            ->assertJsonMissingPath('data.analysis.remaining');
    }

    public function test_a_free_account_reports_its_real_usage_and_remaining_count(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));
        $user = User::factory()->create();
        $project = $this->makeProjectOnPlan($user, ['analyses_per_month' => 3, 'plans_per_month' => 10, 'storage_mb' => 200]);

        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->createWithContent('plan.pdf', 'some-bytes'),
            $project,
            $user
        );
        $this->actingAs($user)->postJson("/api/v1/plans/{$plan->id}/analyze");

        $response = $this->actingAs($user)->getJson("/api/v1/projects/{$project->id}/analysis-access");

        $response->assertStatus(200)
            ->assertJsonPath('data.account_type', 'free')
            ->assertJsonPath('data.analysis.allowed', true)
            ->assertJsonPath('data.analysis.unlimited', false)
            ->assertJsonPath('data.analysis.used', 1)
            ->assertJsonPath('data.analysis.limit', 3)
            ->assertJsonPath('data.analysis.remaining', 2);
    }

    public function test_a_user_outside_the_organization_cannot_read_analysis_access(): void
    {
        $owner = User::factory()->create();
        $project = $this->makeProjectOnPlan($owner, ['analyses_per_month' => 3]);
        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->getJson("/api/v1/projects/{$project->id}/analysis-access")
            ->assertStatus(403);
    }
}
