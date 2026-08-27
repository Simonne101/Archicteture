<?php

namespace App\Services\Estimation;

use App\Enums\EstimateStatus;
use App\Exceptions\EstimationException;
use App\Jobs\GenerateEstimateJob;
use App\Models\Estimate;
use App\Models\Material;
use App\Models\PlanAnalysis;
use App\Models\User;
use App\Notifications\EstimateReadyNotification;
use App\Services\AuditLogService;
use App\Services\Estimation\Rules\ConcreteRule;
use App\Services\Estimation\Rules\RebarRule;
use Illuminate\Support\Facades\DB;

class EstimationService
{
    /** @var EstimationRuleInterface[] */
    private array $rules;

    public function __construct(
        private readonly AuditLogService $auditLog,
        private readonly UnitConversionService $units,
    ) {
        // Only the rules that are actually implemented today (spec §21 lists
        // more — Foundation/Wall/Slab/Column/Beam/Roof — as examples of a
        // fuller rule set to add later, following this same interface).
        $this->rules = [
            new ConcreteRule,
            new RebarRule,
        ];
    }

    /**
     * Creates the Estimate immediately (so the caller gets a pollable ID
     * right away) and queues the actual calculation — never runs it inline,
     * same async pattern as plan analysis (spec §29).
     */
    public function start(PlanAnalysis $analysis, User $creator): Estimate
    {
        if (! $analysis->isConfirmed()) {
            throw new EstimationException(
                "L'analyse doit être confirmée avant de générer une estimation."
            );
        }

        $project = $analysis->plan->project;

        $estimate = Estimate::create([
            'project_id' => $project->id,
            'plan_id' => $analysis->plan_id,
            'analysis_id' => $analysis->id,
            'status' => EstimateStatus::Processing,
            'currency' => $project->currency,
            // Snapshotted so a later change to the project's country never
            // rewrites this estimate's context (spec §5/§19).
            'country_code' => $project->country_code,
            'calculation_version' => config('build_estimate.calculation_version'),
            'ai_provider' => $analysis->provider,
            'ai_model' => $analysis->model,
            'input_snapshot' => [
                'analysis_confidence_score' => $analysis->confidence_score,
                'measurement_count' => $analysis->measurements()->count(),
            ],
            'created_by' => $creator->id,
        ]);

        GenerateEstimateJob::dispatch($estimate);

        return $estimate;
    }

    /**
     * The AI never invents final quantities directly (spec §20) — it only
     * produced the measurements; these rules are what deterministically
     * turn measurements into material quantities.
     *
     * Business rule: BUILD ESTIMATE AI estimates MATERIAL QUANTITIES, never
     * cost. No price is looked up, computed, or stored here — the country
     * is used exclusively to pick locally-relevant display units (sac,
     * roue, barre...) via UnitConversionService, never a price catalog.
     */
    public function calculate(Estimate $estimate): void
    {
        $analysis = $estimate->analysis;
        $measurements = $analysis->measurements;
        $countryCode = $estimate->country_code;

        DB::transaction(function () use ($estimate, $measurements, $countryCode) {
            foreach ($this->rules as $rule) {
                foreach ($rule->calculate($measurements) as $line) {
                    $material = Material::where('code', $line['material_code'])->where('active', true)->first();

                    if (! $material) {
                        throw new EstimationException(
                            "Matériau introuvable ou inactif : [{$line['material_code']}]. Ajoutez-le au catalogue avant de générer une estimation."
                        );
                    }

                    // Quantity/unit computation is a pure function of the
                    // plan's measurements. The physical quantity
                    // (`quantity`/`unit`, e.g. tonnes) stays the displayed
                    // default exactly as before — never silently
                    // auto-switched to a commercial unit (spec §25: no
                    // automatic guess of what a project "should" display;
                    // that's an explicit user choice via
                    // available_display_units, see EstimateItemResource).
                    $conversion = $countryCode
                        ? $this->units->resolve($material, $line['quantity'], $line['unit'], $countryCode)
                        : null;

                    $estimate->items()->create([
                        'material_id' => $material->id,
                        'description' => $material->name,
                        'quantity' => $line['quantity'],
                        'unit' => $line['unit'],
                        'quantity_base' => $conversion['quantity_base'] ?? $line['quantity'],
                        'base_unit' => $conversion['base_unit'] ?? $line['unit'],
                        'display_unit' => $line['unit'],
                        'display_unit_configured' => $conversion['display_unit_configured'] ?? false,
                        'calculation_method' => $rule::class,
                        'assumptions' => array_filter([
                            'measurement_source' => 'plan_analysis',
                        ]),
                        'metadata' => $line['metadata'] ?? null,
                    ]);
                }
            }

            $estimate->update(['status' => EstimateStatus::Completed]);
        });

        $this->auditLog->log('estimate.generated', $estimate, $estimate->creator, $estimate->project->organization);
        $estimate->creator->notify(new EstimateReadyNotification($estimate->fresh()));
    }
}
