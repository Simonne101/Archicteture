<?php

namespace Database\Seeders;

use App\Enums\AnalysisStatus;
use App\Enums\EstimateStatus;
use App\Enums\MeasurementCategory;
use App\Enums\MeasurementSource;
use App\Enums\PlanStatus;
use App\Enums\ProjectStatus;
use App\Enums\ReportStatus;
use App\Models\Estimate;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\Project;
use App\Models\Report;
use App\Models\User;
use App\Services\Estimation\EstimationService;
use App\Services\Report\ReportService;
use App\Support\CurrencyRegistry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Seeds 4 public, read-only showcase projects for the "Voir une démo"
 * selector — reusing the exact same tables and calculation engine as a real
 * project (EstimationService/ConcreteRule/RebarRule, DomPDF report), so demo
 * numbers are as authentic as any user's, never hand-typed magic values
 * (spec §37). They differ only in `is_demo=true` — see the public
 * DemoController that never mixes them with a real user's own projects.
 *
 * Idempotent: matched by demo_slug, safe to re-run.
 */
class DemoProjectSeeder extends Seeder
{
    public function __construct(
        private readonly EstimationService $estimation,
        private readonly ReportService $reports,
    ) {}

    public function run(): void
    {
        $owner = User::where('email', env('DEMO_USER_EMAIL', 'demo@buildestimate.ai'))->first();

        if (! $owner) {
            $this->command?->warn('DemoProjectSeeder skipped: run DemoUserSeeder first.');

            return;
        }

        $organization = $owner->defaultOrganization();

        if (! $organization) {
            $this->command?->warn('DemoProjectSeeder skipped: the demo user has no organization yet.');

            return;
        }

        foreach ($this->scenarios() as $scenario) {
            $this->seedScenario($organization, $owner, $scenario);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function scenarios(): array
    {
        return [
            [
                'slug' => 'villa-plain-pied',
                'name' => 'Villa plain-pied',
                'description' => 'Plan simple sur un seul niveau — démonstration de l\'estimation de base.',
                'project_type' => 'maison_individuelle',
                'location' => 'Dakar, Sénégal',
                'country_code' => 'BJ',
                'walls' => [
                    ['label' => 'Murs extérieurs', 'length' => 44.0, 'height' => 3.0, 'thickness' => 0.2],
                ],
                'rooms' => [
                    ['label' => 'Salon', 'surface' => 28.0],
                    ['label' => 'Chambre 1', 'surface' => 14.0],
                    ['label' => 'Cuisine', 'surface' => 10.0],
                ],
                'openings' => [
                    ['label' => 'Porte d\'entrée', 'width' => 0.9, 'height' => 2.1],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                ],
                'levels' => [['label' => 'Rez-de-chaussée', 'height' => 3.0]],
            ],
            [
                'slug' => 'villa-r1',
                'name' => 'Villa R+1',
                'description' => 'Projet résidentiel à deux niveaux — montre la gestion de plusieurs étages.',
                'project_type' => 'villa',
                'location' => 'Abidjan, Côte d\'Ivoire',
                'country_code' => 'CI',
                'walls' => [
                    ['label' => 'Murs extérieurs — rez-de-chaussée', 'length' => 44.0, 'height' => 3.0, 'thickness' => 0.2],
                    ['label' => 'Murs extérieurs — étage', 'length' => 44.0, 'height' => 3.0, 'thickness' => 0.2],
                ],
                'rooms' => [
                    ['label' => 'Salon', 'surface' => 30.0],
                    ['label' => 'Cuisine', 'surface' => 12.0],
                    ['label' => 'Chambre parentale', 'surface' => 18.0],
                    ['label' => 'Chambre 2', 'surface' => 14.0],
                    ['label' => 'Salle familiale', 'surface' => 16.0],
                ],
                'openings' => [
                    ['label' => 'Porte d\'entrée', 'width' => 0.9, 'height' => 2.1],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                ],
                'levels' => [
                    ['label' => 'Rez-de-chaussée', 'height' => 3.0],
                    ['label' => 'Étage', 'height' => 3.0],
                ],
            ],
            [
                'slug' => 'batiment-professionnel',
                'name' => 'Bâtiment professionnel',
                'description' => 'Plan plus complexe avec plusieurs espaces de travail.',
                'project_type' => 'bureau',
                'location' => 'Cotonou, Bénin',
                'country_code' => 'BJ',
                'walls' => [
                    ['label' => 'Murs extérieurs', 'length' => 70.0, 'height' => 3.5, 'thickness' => 0.25],
                    ['label' => 'Cloisons intérieures', 'length' => 38.0, 'height' => 3.0, 'thickness' => 0.15],
                ],
                'rooms' => [
                    ['label' => 'Espace ouvert', 'surface' => 60.0],
                    ['label' => 'Salle de réunion 1', 'surface' => 18.0],
                    ['label' => 'Salle de réunion 2', 'surface' => 18.0],
                    ['label' => 'Bureau direction', 'surface' => 16.0],
                    ['label' => 'Accueil', 'surface' => 12.0],
                ],
                'openings' => [
                    ['label' => 'Porte d\'entrée vitrée', 'width' => 1.6, 'height' => 2.2],
                    ['label' => 'Fenêtre', 'width' => 1.5, 'height' => 1.4],
                    ['label' => 'Fenêtre', 'width' => 1.5, 'height' => 1.4],
                    ['label' => 'Fenêtre', 'width' => 1.5, 'height' => 1.4],
                    ['label' => 'Fenêtre', 'width' => 1.5, 'height' => 1.4],
                    ['label' => 'Fenêtre', 'width' => 1.5, 'height' => 1.4],
                ],
                'levels' => [['label' => 'Rez-de-chaussée', 'height' => 3.5]],
            ],
            [
                'slug' => 'projet-complet',
                'name' => 'Projet complet',
                'description' => 'Démonstration du parcours complet : import, analyse, vérification, estimation, rapport.',
                'project_type' => 'villa',
                'location' => 'Lomé, Togo',
                'country_code' => 'TG',
                'walls' => [
                    ['label' => 'Murs extérieurs — rez-de-chaussée', 'length' => 48.0, 'height' => 3.0, 'thickness' => 0.2],
                    ['label' => 'Murs extérieurs — étage', 'length' => 48.0, 'height' => 3.0, 'thickness' => 0.2],
                ],
                'rooms' => [
                    ['label' => 'Salon', 'surface' => 32.0],
                    ['label' => 'Cuisine', 'surface' => 14.0],
                    ['label' => 'Chambre parentale', 'surface' => 20.0],
                    ['label' => 'Chambre 2', 'surface' => 15.0],
                    ['label' => 'Chambre 3', 'surface' => 14.0],
                    ['label' => 'Bureau', 'surface' => 10.0],
                ],
                'openings' => [
                    ['label' => 'Porte d\'entrée', 'width' => 1.0, 'height' => 2.1],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                ],
                'levels' => [
                    ['label' => 'Rez-de-chaussée', 'height' => 3.0],
                    ['label' => 'Étage', 'height' => 3.0],
                ],
            ],
            [
                'slug' => 'maison-france',
                'name' => 'Maison individuelle — France',
                'description' => 'Même moteur de calcul, référentiel de prix et devise du marché français (EUR).',
                'project_type' => 'maison_individuelle',
                'location' => 'Lyon, France',
                'country_code' => 'FR',
                'walls' => [
                    ['label' => 'Murs extérieurs', 'length' => 40.0, 'height' => 2.7, 'thickness' => 0.2],
                ],
                'rooms' => [
                    ['label' => 'Séjour', 'surface' => 26.0],
                    ['label' => 'Chambre 1', 'surface' => 12.0],
                    ['label' => 'Chambre 2', 'surface' => 11.0],
                    ['label' => 'Cuisine', 'surface' => 9.0],
                ],
                'openings' => [
                    ['label' => 'Porte d\'entrée', 'width' => 0.9, 'height' => 2.1],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                ],
                'levels' => [['label' => 'Rez-de-chaussée', 'height' => 2.7]],
            ],
            [
                'slug' => 'villa-cameroun',
                'name' => 'Villa — Cameroun',
                'description' => 'Même moteur de calcul, référentiel de prix et devise du marché camerounais (XAF).',
                'project_type' => 'villa',
                'location' => 'Douala, Cameroun',
                'country_code' => 'CM',
                'walls' => [
                    ['label' => 'Murs extérieurs — rez-de-chaussée', 'length' => 46.0, 'height' => 3.0, 'thickness' => 0.2],
                    ['label' => 'Murs extérieurs — étage', 'length' => 46.0, 'height' => 3.0, 'thickness' => 0.2],
                ],
                'rooms' => [
                    ['label' => 'Salon', 'surface' => 30.0],
                    ['label' => 'Cuisine', 'surface' => 13.0],
                    ['label' => 'Chambre parentale', 'surface' => 18.0],
                    ['label' => 'Chambre 2', 'surface' => 14.0],
                ],
                'openings' => [
                    ['label' => 'Porte d\'entrée', 'width' => 1.0, 'height' => 2.1],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                    ['label' => 'Fenêtre', 'width' => 1.2, 'height' => 1.2],
                ],
                'levels' => [
                    ['label' => 'Rez-de-chaussée', 'height' => 3.0],
                    ['label' => 'Étage', 'height' => 3.0],
                ],
            ],
        ];
    }

    private function seedScenario(Organization $organization, User $owner, array $scenario): void
    {
        $existing = Project::where('demo_slug', $scenario['slug'])->first();

        if ($existing) {
            // Idempotent refresh: the project/plan/analysis/measurements
            // never change between runs (spec: "conserve-les, ne change pas
            // inutilement leur contenu"), but the estimate is recomputed
            // through the current EstimationService/UnitConversionService
            // so an older demo (seeded before a calculation-engine change)
            // picks up new fields like quantity_base/available_display_units
            // without ever duplicating rows.
            $this->refreshEstimate($existing);
            $this->command?->info("Demo project refreshed: {$scenario['name']} ({$scenario['slug']})");

            return;
        }

        $project = new Project([
            'organization_id' => $organization->id,
            'created_by' => $owner->id,
            'name' => $scenario['name'],
            'description' => $scenario['description'],
            'project_type' => $scenario['project_type'],
            'location' => $scenario['location'],
            'country_code' => $scenario['country_code'],
            'currency' => CurrencyRegistry::currencyForCountry($scenario['country_code']),
            'status' => ProjectStatus::Completed,
        ]);
        // is_demo/demo_slug are deliberately not mass-assignable (never
        // trusted from a request) — forceFill is the trusted seeder path.
        $project->forceFill([
            'is_demo' => true,
            'demo_slug' => $scenario['slug'],
        ]);
        $project->save();

        $disk = config('build_estimate.storage_disk');
        $content = "Plan de démonstration — {$scenario['name']}\n\nCeci est un document de démonstration, généré pour illustrer BUILD ESTIMATE AI. Aucune donnée réelle n'est utilisée.";
        $path = "projects/{$project->id}/plans/".Str::uuid()->toString().'.txt';
        Storage::disk($disk)->put($path, $content);

        $plan = Plan::create([
            'project_id' => $project->id,
            'uploaded_by' => $owner->id,
            'original_filename' => 'Plan de démonstration.txt',
            'storage_path' => $path,
            'mime_type' => 'text/plain',
            'file_size' => strlen($content),
            'checksum' => hash('sha256', $content),
            'status' => PlanStatus::Analyzed,
        ]);

        $analysis = PlanAnalysis::create([
            'plan_id' => $plan->id,
            'status' => AnalysisStatus::Completed,
            'provider' => 'demo',
            'calculation_version' => config('build_estimate.calculation_version'),
            'confidence_score' => 0.97,
            'started_at' => now(),
            'completed_at' => now(),
            'confirmed_by' => $owner->id,
            'confirmed_at' => now(),
        ]);

        foreach ($scenario['walls'] as $wall) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Wall,
                'label' => $wall['label'],
                'length' => $wall['length'],
                'height' => $wall['height'],
                'thickness' => $wall['thickness'],
                'unit' => 'm',
                'source' => MeasurementSource::AI,
                'confidence' => 0.95,
            ]);
        }

        foreach ($scenario['rooms'] as $room) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Room,
                'label' => $room['label'],
                'surface' => $room['surface'],
                'unit' => 'm2',
                'source' => MeasurementSource::AI,
                'confidence' => 0.93,
            ]);
        }

        foreach ($scenario['openings'] as $opening) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Opening,
                'label' => $opening['label'],
                'width' => $opening['width'],
                'height' => $opening['height'],
                'unit' => 'm',
                'source' => MeasurementSource::AI,
                'confidence' => 0.9,
            ]);
        }

        foreach ($scenario['levels'] as $level) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Level,
                'label' => $level['label'],
                'height' => $level['height'],
                'unit' => 'm',
                'source' => MeasurementSource::AI,
                'confidence' => 0.98,
            ]);
        }

        // Built directly (bypassing EstimationService::start()'s queue
        // dispatch/quota check — a seeder runs synchronously and demo
        // content is exempt from quotas by definition) but calculated by
        // the exact same EstimationService::calculate() a real project uses.
        $estimate = Estimate::create([
            'project_id' => $project->id,
            'plan_id' => $plan->id,
            'analysis_id' => $analysis->id,
            'status' => EstimateStatus::Processing,
            'currency' => $project->currency,
            'country_code' => $project->country_code,
            'calculation_version' => config('build_estimate.calculation_version'),
            'ai_provider' => $analysis->provider,
            'ai_model' => $analysis->model,
            'input_snapshot' => [
                'analysis_confidence_score' => $analysis->confidence_score,
                'measurement_count' => $analysis->measurements()->count(),
            ],
            'created_by' => $owner->id,
        ]);

        $this->estimation->calculate($estimate);

        $report = Report::create([
            'estimate_id' => $estimate->id,
            'generated_by' => $owner->id,
            'status' => ReportStatus::Processing,
        ]);

        $this->reports->generate($report);

        $this->command?->info("Demo project seeded: {$scenario['name']} ({$scenario['slug']})");
    }

    /**
     * Recomputes an existing demo project's Estimate/Report in place —
     * never touches Project/Plan/PlanAnalysis/Measurement rows, and never
     * creates a second Estimate or Report for the same project (scoped
     * strictly to this one project's own records, verified by the caller
     * matching on `demo_slug`).
     */
    private function refreshEstimate(Project $project): void
    {
        $estimate = $project->estimates()->first();

        if (! $estimate) {
            return;
        }

        // Old line items reflect a previous version of the calculation
        // engine (e.g. no quantity_base/calculation_method yet) — they are
        // deleted only by estimate_id, itself scoped to this one demo
        // project, never touching another estimate's items.
        $estimate->items()->delete();
        $estimate->update(['status' => EstimateStatus::Processing, 'subtotal' => 0, 'total' => 0]);

        $this->estimation->calculate($estimate->fresh());

        $report = $estimate->reports()->first();

        if ($report) {
            if ($report->storage_path) {
                Storage::disk(config('build_estimate.storage_disk'))->delete($report->storage_path);
            }

            $report->update(['status' => ReportStatus::Processing, 'storage_path' => null, 'file_size' => null]);
            $this->reports->generate($report->fresh());
        }
    }
}
