<?php

namespace Tests\Feature\Currency;

use App\DTOs\AIAnalysisResult;
use App\Models\Estimate;
use App\Models\Plan;
use App\Models\User;
use App\Services\AI\AIProviderInterface;
use App\Services\Analysis\PlanAnalysisService;
use App\Services\Estimation\EstimationService;
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
 * Country selection is kept (it drives locally-relevant material UNITS —
 * sac, roue, barre...) but no longer drives, computes, or exposes any
 * price. BUILD ESTIMATE AI estimates material quantities only (business
 * rule, see EstimationService).
 */
class CurrencySystemTest extends TestCase
{
    use RefreshDatabase;

    private function bindWallProvider(): void
    {
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
    }

    private function makeEstimateForCountry(User $user, string $countryCode): Estimate
    {
        $this->bindWallProvider();
        Storage::fake(config('build_estimate.storage_disk'));

        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet '.$countryCode], $user);
        $project = app(ProjectService::class)->create(['name' => 'Projet '.$countryCode, 'country_code' => $countryCode], $organization, $user);
        $plan = app(PlanService::class)->upload(
            UploadedFile::fake()->createWithContent("plan-{$countryCode}.pdf", "contenu-{$countryCode}"),
            $project,
            $user
        );
        $analysis = app(PlanAnalysisService::class)->start($plan, $user);
        app(PlanAnalysisService::class)->confirm($analysis->fresh(), $user);

        return app(EstimationService::class)->start($analysis->fresh(), $user)->fresh();
    }

    public function test_creating_a_project_in_france_sets_eur(): void
    {
        $user = User::factory()->create();
        app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Maison Lyon',
            'country_code' => 'FR',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.country_code', 'FR');
    }

    public function test_creating_a_project_in_benin_sets_the_country(): void
    {
        $user = User::factory()->create();
        app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Villa Cotonou',
            'country_code' => 'BJ',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.country_code', 'BJ');
    }

    public function test_creating_a_project_in_cameroon_sets_the_country(): void
    {
        $user = User::factory()->create();
        app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Villa Douala',
            'country_code' => 'CM',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.country_code', 'CM');
    }

    public function test_country_code_is_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Projet sans pays',
        ])->assertStatus(422);
    }

    /**
     * The country must never resurface as a price selector — sending a
     * `currency` field alongside a project is silently ignored, never
     * validated against anything, since the estimation engine has no
     * financial concept of currency any more.
     */
    public function test_sending_a_currency_field_has_no_effect_on_project_creation(): void
    {
        $user = User::factory()->create();
        app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Projet',
            'country_code' => 'BJ',
            'currency' => 'EUR',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.country_code', 'BJ');
    }

    /**
     * Two identical plans in different countries must produce the exact
     * same physical quantities (the calculation is a pure function of the
     * plan's measurements) — country only ever changes which LOCAL UNIT is
     * offered alongside that quantity, never the quantity itself, and never
     * a price.
     */
    public function test_two_identical_projects_in_different_countries_produce_the_same_quantities(): void
    {
        $this->seed(MaterialSeeder::class);
        $this->seed(UnitSeeder::class);
        $this->seed(UnitConversionSeeder::class);
        $user = User::factory()->create();

        $beninEstimate = $this->makeEstimateForCountry($user, 'BJ');
        $franceEstimate = $this->makeEstimateForCountry($user, 'FR');

        $beninCiment = $beninEstimate->items()->whereHas('material', fn ($q) => $q->where('code', 'ciment'))->first();
        $franceCiment = $franceEstimate->items()->whereHas('material', fn ($q) => $q->where('code', 'ciment'))->first();

        $this->assertSame((float) $beninCiment->quantity_base, (float) $franceCiment->quantity_base);
        $this->assertSame($beninCiment->base_unit, $franceCiment->base_unit);
        $this->assertNull($beninCiment->unit_price);
        $this->assertNull($franceCiment->unit_price);
    }

    public function test_changing_a_projects_country_is_persisted(): void
    {
        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        $project = app(ProjectService::class)->create(['name' => 'Villa', 'country_code' => 'BJ'], $organization, $user);

        $this->assertSame('BJ', $project->country_code);

        $response = $this->actingAs($user)->patchJson("/api/v1/projects/{$project->id}", [
            'country_code' => 'FR',
        ]);

        $response->assertStatus(200)->assertJsonPath('data.country_code', 'FR');
    }

    /**
     * No estimate item, at any endpoint, may ever expose a price field.
     */
    public function test_no_estimate_item_exposes_a_price_field(): void
    {
        $this->seed(MaterialSeeder::class);
        $user = User::factory()->create();

        $estimate = $this->makeEstimateForCountry($user, 'FR');

        $show = $this->actingAs($user)->getJson("/api/v1/estimates/{$estimate->id}");
        $show->assertStatus(200)->assertJsonMissingPath('data.subtotal')->assertJsonMissingPath('data.total');

        foreach ($show->json('data.items') as $item) {
            $this->assertArrayNotHasKey('unit_price', $item);
            $this->assertArrayNotHasKey('total_price', $item);
            $this->assertArrayNotHasKey('currency', $item);
        }
    }

    public function test_the_report_pdf_never_renders_a_price_or_currency_symbol(): void
    {
        $this->seed(MaterialSeeder::class);
        $user = User::factory()->create();
        $estimate = $this->makeEstimateForCountry($user, 'FR');
        $estimate->load(['project.organization', 'plan', 'analysis', 'creator', 'items.material']);

        $html = view('reports.estimate', [
            'estimate' => $estimate,
            'project' => $estimate->project,
            'plan' => $estimate->plan,
            'equivalents' => [],
            'generatedAt' => now(),
        ])->render();

        $this->assertStringNotContainsString('€', $html);
        $this->assertStringNotContainsString('FCFA', $html);
        $this->assertStringNotContainsString('Prix unitaire', $html);
        $this->assertStringNotContainsString('Devise', $html);
    }

    /**
     * A project's country can change after an estimate exists, but the
     * estimate's own snapshotted country never silently rewrites (spec
     * §5/§19) — it keeps determining the quantities/units already computed.
     */
    public function test_an_old_estimate_keeps_its_own_country_after_the_project_changes(): void
    {
        $this->seed(MaterialSeeder::class);
        $user = User::factory()->create();

        $estimate = $this->makeEstimateForCountry($user, 'BJ');
        $this->assertSame('BJ', $estimate->country_code);

        $this->actingAs($user)->patchJson("/api/v1/projects/{$estimate->project_id}", [
            'country_code' => 'FR',
        ])->assertStatus(200);

        $estimate->refresh();

        $this->assertSame('BJ', $estimate->country_code, 'An already-generated estimate must never be silently rewritten.');
    }
}
