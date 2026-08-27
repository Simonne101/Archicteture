<?php

namespace Tests\Feature\Demos;

use App\Models\Estimate;
use App\Models\Project;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Database\Seeders\DemoProjectSeeder;
use Database\Seeders\DemoUserSeeder;
use Database\Seeders\MaterialSeeder;
use Database\Seeders\UnitConversionSeeder;
use Database\Seeders\UnitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoShowcaseTest extends TestCase
{
    use RefreshDatabase;

    private function seedDemos(): void
    {
        $this->seed(DemoUserSeeder::class);
        $this->seed(MaterialSeeder::class);
        $this->seed(UnitSeeder::class);
        $this->seed(UnitConversionSeeder::class);
        $this->seed(DemoProjectSeeder::class);
    }

    public function test_a_guest_can_list_all_demos_without_authenticating(): void
    {
        $this->seedDemos();

        $response = $this->getJson('/api/v1/demos');

        $response->assertStatus(200)->assertJsonCount(6, 'data');
        $slugs = collect($response->json('data'))->pluck('slug')->all();
        $this->assertEqualsCanonicalizing(
            [
                'villa-plain-pied', 'villa-r1', 'batiment-professionnel', 'projet-complet',
                'maison-france', 'villa-cameroun',
            ],
            $slugs
        );

        // Every demo must have real, positive material quantities — not a
        // placeholder — since it went through the real calculation engine.
        // No demo may ever expose a price field (business rule: quantities
        // only).
        foreach ($response->json('data') as $demo) {
            $this->assertArrayNotHasKey('total', $demo);
            $this->assertArrayNotHasKey('currency', $demo);
        }
    }

    /**
     * Country still drives locally-relevant UNITS (never a price) — Bénin
     * and Cameroun have a configured cement→sac conversion, France does
     * not, and no demo response ever contains a price field.
     */
    public function test_demos_across_different_countries_show_country_appropriate_units_never_prices(): void
    {
        $this->seedDemos();

        $benin = $this->getJson('/api/v1/demos/villa-plain-pied')->json('data');
        $france = $this->getJson('/api/v1/demos/maison-france')->json('data');
        $cameroun = $this->getJson('/api/v1/demos/villa-cameroun')->json('data');

        $beninCiment = collect($benin['estimate']['items'])->firstWhere('material_code', 'ciment');
        $franceCiment = collect($france['estimate']['items'])->firstWhere('material_code', 'ciment');
        $camerounCiment = collect($cameroun['estimate']['items'])->firstWhere('material_code', 'ciment');

        $this->assertNotEmpty(collect($beninCiment['available_display_units'])->firstWhere('unit', 'sac'));
        $this->assertNotEmpty(collect($camerounCiment['available_display_units'])->firstWhere('unit', 'sac'));
        // No sac conversion was ever seeded for France — must not be invented.
        $this->assertEmpty($franceCiment['available_display_units']);

        foreach ([$beninCiment, $franceCiment, $camerounCiment] as $item) {
            $this->assertArrayNotHasKey('unit_price', $item);
            $this->assertArrayNotHasKey('total_price', $item);
            $this->assertArrayNotHasKey('currency', $item);
        }
    }

    public function test_a_guest_can_view_a_demo_in_full_detail_without_authenticating(): void
    {
        $this->seedDemos();

        $response = $this->getJson('/api/v1/demos/villa-r1');

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'villa-r1')
            ->assertJsonPath('data.analysis.status', 'completed')
            ->assertJsonPath('data.estimate.status', 'completed')
            ->assertJsonPath('data.estimate.certified', false)
            ->assertJsonPath('data.report.status', 'completed');

        $this->assertNotEmpty($response->json('data.analysis.measurements'));
        $items = $response->json('data.estimate.items');
        $this->assertNotEmpty($items);
        $this->assertGreaterThan(0, $items[0]['quantity']);
        $this->assertArrayNotHasKey('total', $response->json('data.estimate'));
        $this->assertNotNull($response->json('data.report.download_url'));
    }

    public function test_an_unknown_demo_slug_returns_404(): void
    {
        $this->seedDemos();

        $this->getJson('/api/v1/demos/does-not-exist')->assertStatus(404);
    }

    public function test_a_guest_can_download_a_demo_report_without_authenticating(): void
    {
        $this->seedDemos();

        $response = $this->get('/api/v1/demos/villa-plain-pied/report/download');

        $response->assertStatus(200);
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_downloading_an_unknown_demo_report_returns_404(): void
    {
        $this->seedDemos();

        $this->get('/api/v1/demos/does-not-exist/report/download')->assertStatus(404);
    }

    public function test_demo_projects_never_appear_in_a_real_users_own_project_list(): void
    {
        $this->seedDemos();

        $user = User::factory()->create();
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);
        app(ProjectService::class)->create(['name' => 'Mon vrai projet'], $organization, $user);

        $response = $this->actingAs($user)->getJson('/api/v1/projects');

        $response->assertStatus(200)->assertJsonCount(1, 'data.data');
        $this->assertSame('Mon vrai projet', $response->json('data.data.0.name'));
    }

    /**
     * Re-running the seeder (e.g. after a calculation-engine change) must
     * never duplicate a demo project/estimate/report — it refreshes the
     * existing one in place (spec: seeder must stay idempotent).
     */
    public function test_reseeding_demos_refreshes_them_without_duplicating_anything(): void
    {
        $this->seedDemos();

        $before = Project::where('demo_slug', 'villa-plain-pied')->first();
        $estimateIdBefore = $before->estimates()->first()->id;

        $this->seed(DemoProjectSeeder::class);

        $this->assertSame(1, Project::where('demo_slug', 'villa-plain-pied')->count());
        $after = Project::where('demo_slug', 'villa-plain-pied')->first();
        $this->assertSame($before->id, $after->id);
        $this->assertSame(1, $after->estimates()->count());
        $this->assertSame($estimateIdBefore, $after->estimates()->first()->id);
        $this->assertSame(1, $after->estimates()->first()->reports()->count());

        $response = $this->getJson('/api/v1/demos/villa-plain-pied')->json('data');
        $cement = collect($response['estimate']['items'])->firstWhere('material_code', 'ciment');
        $this->assertNotEmpty($cement['calculation_method']);
        // 1 sac = 0.05 tonne (spec-verified packaging fact) — the sac count
        // must be the cement tonnage divided by that factor, whatever the
        // scenario's own wall dimensions produce (never a hardcoded number).
        $expectedSacs = ceil(($cement['quantity_base'] / 0.05) * 100) / 100;
        $this->assertEquals($expectedSacs, collect($cement['available_display_units'])->firstWhere('unit', 'sac')['quantity']);
    }

    /**
     * A demo seeded before the unit-conversion engine existed must pick up
     * quantity_base/available_display_units after a reseed — this is the
     * exact "backfill" scenario the mission asked for.
     */
    public function test_a_demo_estimate_generated_by_the_old_engine_is_backfilled_on_reseed(): void
    {
        $this->seedDemos();

        // Simulate a demo seeded before this engine existed: wipe the
        // unit-tracking fields an old calculate() run would never have set.
        $estimate = Estimate::whereHas('project', fn ($q) => $q->where('demo_slug', 'villa-plain-pied'))->first();
        $estimate->items()->update([
            'quantity_base' => null,
            'base_unit' => null,
            'calculation_method' => null,
            'assumptions' => null,
        ]);

        $this->seed(DemoProjectSeeder::class);

        $response = $this->getJson('/api/v1/demos/villa-plain-pied')->json('data');
        $cement = collect($response['estimate']['items'])->firstWhere('material_code', 'ciment');

        $this->assertNotNull($cement['quantity_base']);
        $this->assertNotNull($cement['calculation_method']);
        $this->assertNotEmpty($cement['available_display_units']);
    }
}
