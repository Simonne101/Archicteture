<?php

namespace Tests\Feature\Notifications;

use App\DTOs\AIAnalysisResult;
use App\Models\Plan;
use App\Models\User;
use App\Notifications\AnalysisCompletedNotification;
use App\Notifications\AnalysisFailedNotification;
use App\Notifications\EstimateReadyNotification;
use App\Notifications\ReportReadyNotification;
use App\Services\AI\AIProviderInterface;
use App\Services\Analysis\PlanAnalysisService;
use App\Services\Estimation\EstimationService;
use App\Services\OrganizationService;
use App\Services\PlanService;
use App\Services\ProjectService;
use App\Services\Report\ReportService;
use Database\Seeders\MaterialSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;
use Throwable;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function bindProvider(AIAnalysisResult|Throwable $behavior): void
    {
        $this->app->bind(AIProviderInterface::class, fn () => new class($behavior) implements AIProviderInterface
        {
            public function __construct(private AIAnalysisResult|Throwable $behavior) {}

            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                if ($this->behavior instanceof Throwable) {
                    throw $this->behavior;
                }

                return $this->behavior;
            }

            public function name(): string
            {
                return 'fake-test-provider';
            }
        });
    }

    public function test_the_uploader_is_notified_when_analysis_completes(): void
    {
        Notification::fake();
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );

        $this->bindProvider(new AIAnalysisResult(confidenceScore: 0.95));
        app(PlanAnalysisService::class)->start($plan, $user);

        Notification::assertSentTo($user, AnalysisCompletedNotification::class);
    }

    public function test_the_uploader_is_notified_when_analysis_fails(): void
    {
        Notification::fake();
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );

        $this->bindProvider(new RuntimeException('Le fournisseur IA est indisponible.'));
        app(PlanAnalysisService::class)->start($plan, $user);

        Notification::assertSentTo($user, AnalysisFailedNotification::class);
    }

    public function test_the_creator_is_notified_when_the_estimate_is_ready(): void
    {
        Notification::fake();
        $this->seed(MaterialSeeder::class);
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );

        $this->bindProvider(new AIAnalysisResult(
            walls: [['label' => 'Mur 1', 'length' => 10.0, 'height' => 3.0, 'thickness' => 0.2, 'unit' => 'm', 'confidence' => 0.9]],
            confidenceScore: 0.95,
        ));
        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);
        app(EstimationService::class)->start($analysis->fresh(), $user);

        Notification::assertSentTo($user, EstimateReadyNotification::class);
    }

    public function test_the_generator_is_notified_when_the_report_is_ready(): void
    {
        $this->seed(MaterialSeeder::class);
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );

        $this->bindProvider(new AIAnalysisResult(
            walls: [['label' => 'Mur 1', 'length' => 10.0, 'height' => 3.0, 'thickness' => 0.2, 'unit' => 'm', 'confidence' => 0.9]],
            confidenceScore: 0.95,
        ));
        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);
        $estimate = app(EstimationService::class)->start($analysis->fresh(), $user)->fresh();

        // Notification::fake() must come after estimate generation — it
        // uses the same DomPDF pipeline this test also exercises for the
        // report, and faking earlier would hide a break in the estimate
        // notification instead of just skipping the assertion for it here.
        Notification::fake();
        app(ReportService::class)->start($estimate, $user);

        Notification::assertSentTo($user, ReportReadyNotification::class);
    }
}
