<?php

namespace Tests\Feature\Analysis;

use App\DTOs\AIAnalysisResult;
use App\Enums\AnalysisStatus;
use App\Enums\PlanStatus;
use App\Jobs\AnalyzePlanJob;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\User;
use App\Services\AI\AIProviderInterface;
use App\Services\OrganizationService;
use App\Services\PlanService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PlanAnalysisTest extends TestCase
{
    use RefreshDatabase;

    private function makePlan(User $user): Plan
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);

        return app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );
    }

    private function bindFakeProvider(AIAnalysisResult $result): void
    {
        $this->app->bind(AIProviderInterface::class, fn () => new class($result) implements AIProviderInterface
        {
            public function __construct(private AIAnalysisResult $result) {}

            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                return $this->result;
            }

            public function name(): string
            {
                return 'fake-test-provider';
            }
        });
    }

    public function test_starting_an_analysis_queues_the_job_and_updates_statuses(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $response = $this->actingAs($user)->postJson("/api/v1/plans/{$plan->id}/analyze");

        $response->assertStatus(202)->assertJsonPath('data.status', 'queued');

        Queue::assertPushed(AnalyzePlanJob::class);
        $this->assertSame(PlanStatus::Processing, $plan->fresh()->status);
    }

    public function test_a_high_confidence_analysis_is_completed_and_creates_measurements(): void
    {
        $this->bindFakeProvider(new AIAnalysisResult(
            rooms: [['label' => 'Salon', 'surface' => 28.0, 'unit' => 'm2', 'confidence' => 0.95]],
            confidenceScore: 0.95,
        ));

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $response = $this->actingAs($user)->postJson("/api/v1/plans/{$plan->id}/analyze");
        $analysisId = $response->json('data.id');

        $show = $this->getJson("/api/v1/analyses/{$analysisId}");

        $show->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.confidence_score', 0.95)
            ->assertJsonCount(1, 'data.measurements');

        $this->assertSame(PlanStatus::Analyzed, $plan->fresh()->status);
    }

    public function test_a_low_confidence_analysis_needs_review_instead_of_auto_completing(): void
    {
        $this->bindFakeProvider(new AIAnalysisResult(confidenceScore: 0.4));

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $response = $this->actingAs($user)->postJson("/api/v1/plans/{$plan->id}/analyze");
        $analysisId = $response->json('data.id');

        $this->getJson("/api/v1/analyses/{$analysisId}")
            ->assertJsonPath('data.status', 'needs_review');
    }

    public function test_a_failing_provider_marks_the_analysis_and_plan_as_failed(): void
    {
        $this->app->bind(AIProviderInterface::class, fn () => new class implements AIProviderInterface
        {
            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                throw new \RuntimeException('Le fournisseur IA est indisponible.');
            }

            public function name(): string
            {
                return 'fake-failing-provider';
            }
        });

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $response = $this->actingAs($user)->postJson("/api/v1/plans/{$plan->id}/analyze");
        $analysisId = $response->json('data.id');

        $this->getJson("/api/v1/analyses/{$analysisId}")
            ->assertJsonPath('data.status', 'failed')
            ->assertJsonPath('data.error_message', 'Le fournisseur IA est indisponible.');

        $this->assertSame(PlanStatus::Failed, $plan->fresh()->status);
    }

    public function test_a_needs_review_analysis_can_be_confirmed_after_human_review(): void
    {
        $this->bindFakeProvider(new AIAnalysisResult(confidenceScore: 0.4));

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $analysisId = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->json('data.id');

        $response = $this->postJson("/api/v1/analyses/{$analysisId}/confirm");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_confirmed', true);
    }

    public function test_a_queued_analysis_cannot_be_confirmed(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $analysisId = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->json('data.id');

        $this->assertSame(AnalysisStatus::Queued, PlanAnalysis::find($analysisId)->status);

        $this->postJson("/api/v1/analyses/{$analysisId}/confirm")
            ->assertStatus(422);
    }

    public function test_a_user_can_correct_a_measurement_during_review(): void
    {
        $this->bindFakeProvider(new AIAnalysisResult(
            rooms: [['label' => 'Salon', 'surface' => 28.0, 'unit' => 'm2', 'confidence' => 0.6]],
            confidenceScore: 0.4,
        ));

        $user = User::factory()->create();
        $plan = $this->makePlan($user);

        $analysisId = $this->actingAs($user)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->json('data.id');

        $measurementId = PlanAnalysis::find($analysisId)->measurements()->first()->id;

        $response = $this->patchJson("/api/v1/analyses/{$analysisId}/measurements/{$measurementId}", [
            'surface' => 30.5,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.surface', 30.5)
            ->assertJsonPath('data.source', 'user')
            ->assertJsonPath('data.confidence', null);
    }

    public function test_a_user_outside_the_organization_cannot_trigger_analysis(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        $plan = $this->makePlan($owner);

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->postJson("/api/v1/plans/{$plan->id}/analyze")
            ->assertStatus(403);
    }
}
