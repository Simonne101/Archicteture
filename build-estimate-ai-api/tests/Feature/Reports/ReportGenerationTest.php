<?php

namespace Tests\Feature\Reports;

use App\DTOs\AIAnalysisResult;
use App\Enums\OrganizationRole;
use App\Models\Estimate;
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

class ReportGenerationTest extends TestCase
{
    use RefreshDatabase;

    private function makeCompletedEstimate(User $user): Estimate
    {
        $this->seed(MaterialSeeder::class);
        Storage::fake(config('build_estimate.storage_disk'));

        $this->app->bind(AIProviderInterface::class, fn () => new class implements AIProviderInterface
        {
            public function analyzePlan(Plan $plan): AIAnalysisResult
            {
                return new AIAnalysisResult(
                    walls: [
                        ['label' => 'Mur 1', 'length' => 10.0, 'height' => 3.0, 'thickness' => 0.2, 'unit' => 'm', 'confidence' => 0.9],
                    ],
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

        return app(EstimationService::class)->start($analysis->fresh(), $user)->fresh();
    }

    public function test_generating_a_report_produces_a_downloadable_pdf(): void
    {
        $user = User::factory()->create();
        $estimate = $this->makeCompletedEstimate($user);

        $response = $this->actingAs($user)->postJson("/api/v1/estimates/{$estimate->id}/reports");

        $response->assertStatus(202)->assertJsonPath('data.status', 'processing');
        $reportId = $response->json('data.id');

        $show = $this->getJson("/api/v1/reports/{$reportId}");

        $show->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.download_url', route('reports.download', $reportId));

        $this->assertGreaterThan(0, $show->json('data.file_size'));

        // The internal storage path must never leak through the API.
        $show->assertJsonMissingPath('data.storage_path');

        $download = $this->get("/api/v1/reports/{$reportId}/download");
        $download->assertStatus(200);
        $this->assertSame('application/pdf', $download->headers->get('Content-Type'));
    }

    public function test_a_user_outside_the_organization_cannot_download_a_report(): void
    {
        $owner = User::factory()->create();
        $estimate = $this->makeCompletedEstimate($owner);

        $reportId = $this->actingAs($owner)
            ->postJson("/api/v1/estimates/{$estimate->id}/reports")
            ->json('data.id');

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->get("/api/v1/reports/{$reportId}/download")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_download_a_report(): void
    {
        $user = User::factory()->create();
        $estimate = $this->makeCompletedEstimate($user);

        // Built through the service layer directly (not HTTP + actingAs) so
        // this fixture never leaves an authenticated session behind.
        $report = app(ReportService::class)->start($estimate, $user);

        $this->get("/api/v1/reports/{$report->id}/download")->assertStatus(401);
    }

    public function test_a_viewer_cannot_generate_a_report(): void
    {
        $owner = User::factory()->create();
        $estimate = $this->makeCompletedEstimate($owner);

        $viewer = User::factory()->create();
        $estimate->project->organization->users()->attach($viewer->id, [
            'role' => OrganizationRole::Viewer->value,
        ]);

        $this->actingAs($viewer)
            ->postJson("/api/v1/estimates/{$estimate->id}/reports")
            ->assertStatus(403);
    }
}
