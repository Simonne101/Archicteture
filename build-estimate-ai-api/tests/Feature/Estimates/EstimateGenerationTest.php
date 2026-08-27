<?php

namespace Tests\Feature\Estimates;

use App\DTOs\AIAnalysisResult;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\User;
use App\Services\AI\AIProviderInterface;
use App\Services\Analysis\PlanAnalysisService;
use App\Services\OrganizationService;
use App\Services\PlanService;
use App\Services\ProjectService;
use Database\Seeders\MaterialSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EstimateGenerationTest extends TestCase
{
    use RefreshDatabase;

    private function makeConfirmedAnalysis(User $user): PlanAnalysis
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
                        ['label' => 'Mur 2', 'length' => 8.0, 'height' => 3.0, 'thickness' => 0.2, 'unit' => 'm', 'confidence' => 0.9],
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

        // Built through the service layer directly (not HTTP + actingAs) so
        // this fixture never leaves an authenticated session behind for
        // tests that specifically need to start from a guest.
        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);

        return $analysis->fresh();
    }

    public function test_generating_an_estimate_from_a_confirmed_analysis_calculates_material_quantities(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user);
        $project = $analysis->plan->project;

        $response = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/estimates", [
            'analysis_id' => $analysis->id,
        ]);

        $response->assertStatus(202)->assertJsonPath('data.status', 'processing');
        $estimateId = $response->json('data.id');

        $show = $this->getJson("/api/v1/estimates/{$estimateId}");

        $show->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.certified', false);

        $items = $show->json('data.items');
        $this->assertNotEmpty($items);

        $materialCodes = collect($items)->pluck('material_code');
        $this->assertTrue($materialCodes->contains('ciment'));
        $this->assertTrue($materialCodes->contains('sable'));
        $this->assertTrue($materialCodes->contains('gravillon'));

        // 2 walls of 10m×3m×0.2m + 8m×3m×0.2m = 6 + 4.8 = 10.8 m³ concrete
        // → cement = 10.8 * 350 / 1000 = 3.78 tonnes (config default ratio)
        $cement = collect($items)->firstWhere('material_code', 'ciment');
        $this->assertEquals(3.78, $cement['quantity']);
        $this->assertArrayNotHasKey('unit_price', $cement);
        $this->assertArrayNotHasKey('total_price', $cement);
        $this->assertArrayNotHasKey('currency', $cement);
    }

    public function test_an_estimate_cannot_be_generated_from_an_unconfirmed_analysis(): void
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

        $this->actingAs($user)->postJson("/api/v1/plans/{$plan->id}/analyze");
        $analysis = $plan->analyses()->latest()->first();

        $response = $this->postJson("/api/v1/projects/{$project->id}/estimates", [
            'analysis_id' => $analysis->id,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_a_user_outside_the_organization_cannot_view_an_estimate(): void
    {
        $owner = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($owner);
        $project = $analysis->plan->project;

        $estimateId = $this->actingAs($owner)
            ->postJson("/api/v1/projects/{$project->id}/estimates", ['analysis_id' => $analysis->id])
            ->json('data.id');

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->getJson("/api/v1/estimates/{$estimateId}")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_create_an_estimate(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user);
        $project = $analysis->plan->project;

        $this->postJson("/api/v1/projects/{$project->id}/estimates", [
            'analysis_id' => $analysis->id,
        ])->assertStatus(401);
    }
}
