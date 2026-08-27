<?php

namespace Tests\Feature\Usage;

use App\DTOs\AIAnalysisResult;
use App\Enums\AccountType;
use App\Enums\SubscriptionStatus;
use App\Models\Plan;
use App\Models\Project;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\AI\AIProviderInterface;
use App\Services\OrganizationService;
use App\Services\PlanService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class DemoAccountBypassTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(AccountType $type = AccountType::Free): User
    {
        $user = User::factory()->create();
        $user->forceFill(['account_type' => $type])->save();

        return $user;
    }

    /**
     * A single-analysis-per-month plan — small enough to exhaust in one
     * request, so "quota exceeded" is trivial to trigger for FREE while
     * proving DEMO/ADMIN never hit it.
     */
    private function makeProjectOnExhaustedPlan(User $user): Project
    {
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $plan = SubscriptionPlan::factory()->create(['limits' => [
            'plans_per_month' => 10,
            'analyses_per_month' => 1,
            'storage_mb' => 200,
        ]]);
        Subscription::factory()->create([
            'organization_id' => $organization->id,
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::Active,
        ]);

        return app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
    }

    private function uploadPlan(Project $project, User $user, string $content = 'distinct-content-a'): Plan
    {
        Storage::fake(config('build_estimate.storage_disk'));

        return app(PlanService::class)->upload(
            UploadedFile::fake()->createWithContent(uniqid('plan-').'.pdf', $content),
            $project,
            $user
        );
    }

    private function bindFakeProvider(): void
    {
        $this->app->bind(AIProviderInterface::class, fn () => new class implements AIProviderInterface
        {
            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                return new AIAnalysisResult(confidenceScore: 0.95);
            }

            public function name(): string
            {
                return 'fake-test-provider';
            }
        });
    }

    public function test_free_account_with_quota_available_can_run_an_analysis(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Free);
        $project = $this->makeProjectOnExhaustedPlan($user); // limit = 1, none used yet
        $plan = $this->uploadPlan($project, $user);

        $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->assertStatus(202);
    }

    public function test_free_account_with_exhausted_quota_is_refused(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Free);
        $project = $this->makeProjectOnExhaustedPlan($user);

        $first = $this->uploadPlan($project, $user, 'content-one');
        $this->actingAs($user)->postJson("/api/v1/plans/{$first->id}/analyze")->assertStatus(202);

        $second = $this->uploadPlan($project, $user, 'content-two');
        $this->actingAs($user)
            ->postJson("/api/v1/plans/{$second->id}/analyze")
            ->assertStatus(402)
            ->assertJsonPath('success', false);
    }

    public function test_demo_account_is_never_blocked_even_with_a_theoretically_exhausted_quota(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Demo);
        $project = $this->makeProjectOnExhaustedPlan($user);

        $first = $this->uploadPlan($project, $user, 'content-one');
        $this->actingAs($user)->postJson("/api/v1/plans/{$first->id}/analyze")->assertStatus(202);

        // The plan's quota is already exhausted (limit=1) — a FREE account
        // would get a 402 here (proven above). DEMO must not.
        $second = $this->uploadPlan($project, $user, 'content-two');
        $this->actingAs($user)
            ->postJson("/api/v1/plans/{$second->id}/analyze")
            ->assertStatus(202);
    }

    public function test_demo_account_can_run_several_successive_analyses(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Demo);
        $project = $this->makeProjectOnExhaustedPlan($user);

        foreach (['a', 'b', 'c', 'd'] as $content) {
            $plan = $this->uploadPlan($project, $user, "content-{$content}");
            $this->actingAs($user)
                ->postJson("/api/v1/plans/{$plan->id}/analyze")
                ->assertStatus(202);
        }
    }

    public function test_demo_account_can_create_several_projects(): void
    {
        $user = $this->makeUser(AccountType::Demo);
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet Démo'], $user);

        foreach (['Projet 1', 'Projet 2', 'Projet 3', 'Projet 4'] as $name) {
            $this->actingAs($user)
                ->postJson('/api/v1/projects', ['name' => $name, 'organization_id' => $organization->id, 'country_code' => 'BJ'])
                ->assertStatus(201);
        }
    }

    public function test_demo_account_can_upload_several_documents_beyond_a_theoretical_limit(): void
    {
        $user = $this->makeUser(AccountType::Demo);
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $plan = SubscriptionPlan::factory()->create(['limits' => ['plans_per_month' => 1, 'storage_mb' => 200]]);
        Subscription::factory()->create([
            'organization_id' => $organization->id,
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::Active,
        ]);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);

        for ($i = 0; $i < 3; $i++) {
            Storage::fake(config('build_estimate.storage_disk'));
            $this->actingAs($user)
                ->postJson("/api/v1/projects/{$project->id}/plans", [
                    'file' => UploadedFile::fake()->create("plan-{$i}.pdf", 100, 'application/pdf'),
                ])
                ->assertStatus(201);
        }
    }

    public function test_demo_account_bypasses_the_quota_on_the_manual_no_plan_analysis_path_too(): void
    {
        // The "estimate without uploading a plan" path (ManualAnalysisService)
        // is a second, separate call site into UsageService — this guards
        // against fixing the bypass in one place and missing the other.
        $user = $this->makeUser(AccountType::Demo);
        $project = $this->makeProjectOnExhaustedPlan($user);

        for ($i = 1; $i <= 4; $i++) {
            $this->actingAs($user)->putJson("/api/v1/projects/{$project->id}/input", [
                'dimensions' => ['building_length' => 10 + $i, 'building_width' => 8],
                'structure' => ['levels' => 1],
                'walls' => ['height' => 3, 'thickness' => 0.2],
            ]);

            $this->actingAs($user)
                ->postJson("/api/v1/projects/{$project->id}/input/analyze")
                ->assertStatus(201);
        }
    }

    public function test_a_free_account_does_not_get_the_demo_bypass(): void
    {
        $user = $this->makeUser(AccountType::Free);
        $this->assertFalse($user->isDemo());
        $this->assertFalse($user->account_type->bypassesUsageLimits());
    }

    public function test_an_admin_account_can_run_analyses(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Admin);
        $project = $this->makeProjectOnExhaustedPlan($user);

        $first = $this->uploadPlan($project, $user, 'content-one');
        $this->actingAs($user)->postJson("/api/v1/plans/{$first->id}/analyze")->assertStatus(202);

        $second = $this->uploadPlan($project, $user, 'content-two');
        $this->actingAs($user)->postJson("/api/v1/plans/{$second->id}/analyze")->assertStatus(202);
    }

    public function test_an_unauthenticated_user_cannot_trigger_an_analysis(): void
    {
        Queue::fake();
        $user = $this->makeUser(AccountType::Demo);
        $project = $this->makeProjectOnExhaustedPlan($user);
        $plan = $this->uploadPlan($project, $user);

        $this->postJson("/api/v1/plans/{$plan->id}/analyze")->assertStatus(401);
    }

    public function test_an_invalid_file_is_rejected_even_for_a_demo_account(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));
        $user = $this->makeUser(AccountType::Demo);
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);

        $this->actingAs($user)
            ->postJson("/api/v1/projects/{$project->id}/plans", [
                'file' => UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
            ])
            ->assertStatus(422);
    }

    public function test_a_valid_file_with_an_unavailable_ai_provider_fails_cleanly(): void
    {
        $this->app->bind(AIProviderInterface::class, fn () => new class implements AIProviderInterface
        {
            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                throw new RuntimeException('Le fournisseur IA est indisponible.');
            }

            public function name(): string
            {
                return 'fake-failing-provider';
            }
        });

        $user = $this->makeUser(AccountType::Demo);
        $project = $this->makeProjectOnExhaustedPlan($user);
        $plan = $this->uploadPlan($project, $user);

        $analysisId = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->assertStatus(202)
            ->json('data.id');

        $this->getJson("/api/v1/analyses/{$analysisId}")
            ->assertJsonPath('data.status', 'failed')
            ->assertJsonPath('data.error_message', 'Le fournisseur IA est indisponible.');
    }

    public function test_the_same_document_already_analyzed_reuses_the_existing_result(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Free);
        $project = $this->makeProjectOnExhaustedPlan($user); // limit = 1

        $plan = $this->uploadPlan($project, $user, 'identical-bytes');
        $first = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->assertStatus(202)
            ->json('data.id');

        // Re-uploading the exact same bytes as a second Plan record, then
        // analyzing it, must reuse the first (already completed) analysis —
        // and since no new analysis actually runs, it must NOT be blocked
        // by the exhausted quota, and must NOT dispatch a new job.
        Queue::fake();
        $samePlan = $this->uploadPlan($project, $user, 'identical-bytes');
        $second = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$samePlan->id}/analyze")
            ->assertStatus(202)
            ->json('data.id');

        $this->assertSame($first, $second, 'Analyzing an identical document should reuse the existing analysis.');
        Queue::assertNothingPushed();
    }

    public function test_force_reanalyze_bypasses_the_cache_and_runs_a_new_analysis(): void
    {
        $this->bindFakeProvider();
        $user = $this->makeUser(AccountType::Demo);
        $project = $this->makeProjectOnExhaustedPlan($user);

        $plan = $this->uploadPlan($project, $user, 'identical-bytes');
        $first = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->json('data.id');

        $samePlan = $this->uploadPlan($project, $user, 'identical-bytes');
        $second = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$samePlan->id}/analyze?force=1")
            ->json('data.id');

        $this->assertNotSame($first, $second, 'force=1 must produce a fresh analysis, not the cached one.');
    }
}
