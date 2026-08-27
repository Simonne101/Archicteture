<?php

namespace Tests\Feature\AuditLog;

use App\DTOs\AIAnalysisResult;
use App\Models\Plan;
use App\Models\User;
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
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_creation_plan_upload_and_analysis_confirmation_are_audited(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'project.created',
            'auditable_id' => $project->id,
            'organization_id' => $organization->id,
            'user_id' => $user->id,
        ]);

        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'plan.uploaded',
            'auditable_id' => $plan->id,
            'organization_id' => $organization->id,
        ]);

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

        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'analysis.confirmed',
            'auditable_id' => $analysis->id,
        ]);
    }

    public function test_estimate_generation_and_report_download_are_audited(): void
    {
        $this->seed(MaterialSeeder::class);
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();

        $this->app->bind(AIProviderInterface::class, fn () => new class implements AIProviderInterface
        {
            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                return new AIAnalysisResult(
                    walls: [['label' => 'Mur 1', 'length' => 10.0, 'height' => 3.0, 'thickness' => 0.2, 'unit' => 'm', 'confidence' => 0.9]],
                    confidenceScore: 0.95,
                );
            }

            public function name(): string
            {
                return 'fake-test-provider';
            }
        });

        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );
        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);
        $estimate = app(EstimationService::class)->start($analysis->fresh(), $user)->fresh();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'estimate.generated',
            'auditable_id' => $estimate->id,
        ]);

        $report = app(ReportService::class)->start($estimate, $user)->fresh();

        $this->actingAs($user)->get("/api/v1/reports/{$report->id}/download");

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'report.downloaded',
            'auditable_id' => $report->id,
            'user_id' => $user->id,
        ]);
    }
}
