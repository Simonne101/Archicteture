<?php

namespace Tests\Feature\Estimates;

use App\DTOs\AIAnalysisResult;
use App\Models\Material;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\Unit;
use App\Models\User;
use App\Services\AI\AIProviderInterface;
use App\Services\Analysis\PlanAnalysisService;
use App\Services\Estimation\UnitConversionService;
use App\Services\OrganizationService;
use App\Services\PlanService;
use App\Services\ProjectService;
use Database\Seeders\MaterialSeeder;
use Database\Seeders\UnitConversionSeeder;
use Database\Seeders\UnitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Covers the material-quantity/unit engine: the physical quantity a Rule
 * calculates (tonne, m³...) must stay untouched, while any commercial/local
 * unit (sac, roue...) is only ever offered when a real, configured
 * conversion exists — never guessed (spec "ne jamais inventer une
 * conversion").
 */
class UnitConversionTest extends TestCase
{
    use RefreshDatabase;

    private function makeConfirmedAnalysis(User $user, string $countryCode = 'BJ'): PlanAnalysis
    {
        $this->seed(MaterialSeeder::class);
        $this->seed(UnitSeeder::class);
        $this->seed(UnitConversionSeeder::class);
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
        $project = app(ProjectService::class)->create(['name' => 'Villa Almadies', 'country_code' => $countryCode], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf'),
            $project,
            $user
        );

        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);

        return $analysis->fresh();
    }

    private function generateEstimate(User $user, PlanAnalysis $analysis): array
    {
        $project = $analysis->plan->project;

        $estimateId = $this->actingAs($user)
            ->postJson("/api/v1/projects/{$project->id}/estimates", ['analysis_id' => $analysis->id])
            ->json('data.id');

        return $this->getJson("/api/v1/estimates/{$estimateId}")->json('data');
    }

    public function test_cement_quantity_stays_in_physical_tonnes_and_never_auto_switches_unit(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user, 'BJ');

        $estimate = $this->generateEstimate($user, $analysis);
        $cement = collect($estimate['items'])->firstWhere('material_code', 'ciment');

        $this->assertEquals('tonne', $cement['unit']);
        $this->assertEquals(3.78, $cement['quantity']);
        $this->assertEquals('tonne', $cement['base_unit']);
        $this->assertEquals(3.78, $cement['quantity_base']);
    }

    public function test_cement_in_benin_offers_a_verified_sac_conversion(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user, 'BJ');

        $estimate = $this->generateEstimate($user, $analysis);
        $cement = collect($estimate['items'])->firstWhere('material_code', 'ciment');

        $sac = collect($cement['available_display_units'])->firstWhere('unit', 'sac');
        $this->assertNotNull($sac, 'Expected a sac conversion for cement in Benin.');
        $this->assertTrue($sac['verified']);
        // 3.78 tonnes / 0.05 tonne-per-sac = 75.6 sacs.
        $this->assertEquals(75.6, $sac['quantity']);
    }

    public function test_cement_in_cameroon_also_offers_a_verified_sac_conversion(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user, 'CM');

        $estimate = $this->generateEstimate($user, $analysis);
        $cement = collect($estimate['items'])->firstWhere('material_code', 'ciment');

        $sac = collect($cement['available_display_units'])->firstWhere('unit', 'sac');
        $this->assertNotNull($sac, 'Expected a sac conversion for cement in Cameroon.');
        $this->assertTrue($sac['verified']);
        $this->assertEquals(75.6, $sac['quantity']);
    }

    public function test_cement_in_a_country_without_a_configured_conversion_offers_no_alternative_unit(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user, 'FR');

        $estimate = $this->generateEstimate($user, $analysis);
        $cement = collect($estimate['items'])->firstWhere('material_code', 'ciment');

        // No sac conversion was ever seeded for France — must not be invented.
        $this->assertEmpty($cement['available_display_units']);
        $this->assertEquals('tonne', $cement['unit']);
        $this->assertEquals(3.78, $cement['quantity']);
    }

    public function test_sand_and_gravel_never_offer_a_roue_conversion_because_it_was_never_configured(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user, 'BJ');

        $estimate = $this->generateEstimate($user, $analysis);
        $sable = collect($estimate['items'])->firstWhere('material_code', 'sable');
        $gravillon = collect($estimate['items'])->firstWhere('material_code', 'gravillon');

        // "roue" (wheelbarrow) has no universal capacity — the seeder
        // deliberately never configures it, and the engine must not guess.
        $this->assertEmpty($sable['available_display_units']);
        $this->assertEmpty($gravillon['available_display_units']);
        $this->assertEquals('m3', $sable['unit']);
        $this->assertEquals('m3', $sable['base_unit']);
    }

    public function test_every_estimate_item_records_its_calculation_method_and_assumptions(): void
    {
        $user = User::factory()->create();
        $analysis = $this->makeConfirmedAnalysis($user, 'BJ');

        $estimate = $this->generateEstimate($user, $analysis);
        $cement = collect($estimate['items'])->firstWhere('material_code', 'ciment');

        $this->assertNotEmpty($cement['calculation_method']);
        $this->assertEquals('plan_analysis', $cement['assumptions']['measurement_source']);
    }

    public function test_unit_conversion_service_never_invents_an_unconfigured_conversion(): void
    {
        $this->seed(MaterialSeeder::class);
        $this->seed(UnitSeeder::class);
        $this->seed(UnitConversionSeeder::class);

        $sable = Material::where('code', 'sable')->first();
        $service = app(UnitConversionService::class);

        $result = $service->resolve($sable, 4.2, 'm3', 'BJ');

        $this->assertFalse($result['display_unit_configured']);
        $this->assertEquals('m3', $result['display_unit']);
        $this->assertEquals(4.2, $result['quantity_display']);

        $converted = $service->convertTo($sable, 4.2, 'm3', 'roue', 'BJ');
        $this->assertNull($converted, 'A roue conversion must never be fabricated.');
    }

    public function test_unit_conversion_service_resolves_a_configured_conversion_correctly(): void
    {
        $this->seed(MaterialSeeder::class);
        $this->seed(UnitSeeder::class);
        $this->seed(UnitConversionSeeder::class);

        $ciment = Material::where('code', 'ciment')->first();
        $service = app(UnitConversionService::class);

        $result = $service->resolve($ciment, 3.78, 'tonne', 'BJ');

        $this->assertTrue($result['display_unit_configured']);
        $this->assertEquals('sac', $result['display_unit']);
        $this->assertEquals(75.6, $result['quantity_display']);
        $this->assertTrue($result['verified']);

        $direct = $service->convertTo($ciment, 3.78, 'tonne', 'sac', 'BJ');
        $this->assertEquals(75.6, $direct);
    }

    public function test_the_meta_endpoint_exposes_the_backend_managed_unit_list(): void
    {
        $this->seed(UnitSeeder::class);

        $response = $this->getJson('/api/v1/meta');

        $response->assertStatus(200);
        $units = collect($response->json('data.units'));

        $this->assertTrue($units->contains(fn ($u) => $u['code'] === 'tonne' && $u['type'] === 'physical'));
        $this->assertTrue($units->contains(fn ($u) => $u['code'] === 'sac' && $u['type'] === 'commercial'));
        $this->assertTrue($units->contains(fn ($u) => $u['code'] === 'roue' && $u['type'] === 'commercial'));
    }

    public function test_units_table_distinguishes_physical_from_commercial_types(): void
    {
        $this->seed(UnitSeeder::class);

        $tonne = Unit::where('code', 'tonne')->first();
        $sac = Unit::where('code', 'sac')->first();

        $this->assertTrue($tonne->isPhysical());
        $this->assertFalse($tonne->isCommercial());
        $this->assertTrue($sac->isCommercial());
        $this->assertFalse($sac->isPhysical());
    }
}
