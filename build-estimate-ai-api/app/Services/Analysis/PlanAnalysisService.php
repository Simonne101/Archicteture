<?php

namespace App\Services\Analysis;

use App\Enums\AnalysisStatus;
use App\Enums\MeasurementSource;
use App\Enums\PlanStatus;
use App\Enums\UsageMetric;
use App\Exceptions\PlanAnalysisException;
use App\Jobs\AnalyzePlanJob;
use App\Models\Measurement;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\User;
use App\Services\AI\AIProviderInterface;
use App\Services\AuditLogService;
use App\Services\UsageService;
use Illuminate\Support\Facades\DB;

class PlanAnalysisService
{
    public function __construct(
        private readonly AIProviderInterface $aiProvider,
        private readonly UsageService $usage,
        private readonly AuditLogService $auditLog,
    ) {}

    /**
     * Queues a new analysis for the plan. Never runs the AI call inline —
     * always through the queue (spec §29), so the HTTP request returns
     * immediately regardless of how long the provider takes.
     *
     * Reuses an existing completed analysis of the exact same file
     * (matched by checksum, within the same project) instead of spending
     * quota and re-running the AI provider on it — unless $force is set,
     * which is what an explicit "Réanalyser" action should pass.
     */
    public function start(Plan $plan, User $user, bool $force = false): PlanAnalysis
    {
        if (! $force) {
            $reusable = $this->findReusableAnalysis($plan);

            if ($reusable) {
                return $reusable;
            }
        }

        $organization = $plan->project->organization;
        $this->usage->ensureCanConsume($organization, UsageMetric::AnalysesRun, actor: $user);

        return DB::transaction(function () use ($plan, $organization) {
            $this->usage->increment($organization, UsageMetric::AnalysesRun);

            $analysis = PlanAnalysis::create([
                'plan_id' => $plan->id,
                'status' => AnalysisStatus::Queued,
                'provider' => $this->aiProvider->name(),
                'model' => config('ai.model'),
                'calculation_version' => config('build_estimate.calculation_version'),
            ]);

            $plan->update(['status' => PlanStatus::Processing]);

            AnalyzePlanJob::dispatch($analysis);

            return $analysis;
        });
    }

    /**
     * Applies user corrections to measurements and marks the analysis as
     * reviewed. Does not confirm it — confirm() is a separate, explicit step.
     */
    public function review(PlanAnalysis $analysis, array $measurementCorrections, User $reviewer): PlanAnalysis
    {
        DB::transaction(function () use ($analysis, $measurementCorrections, $reviewer) {
            foreach ($measurementCorrections as $correction) {
                $measurement = Measurement::where('plan_analysis_id', $analysis->id)
                    ->find($correction['id']);

                if (! $measurement) {
                    continue;
                }

                $this->updateMeasurement($measurement, $correction);
            }

            $analysis->update([
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);
        });

        return $analysis->fresh('measurements');
    }

    public function updateMeasurement(Measurement $measurement, array $data): Measurement
    {
        $measurement->fill(array_intersect_key($data, array_flip([
            'label', 'length', 'width', 'height', 'surface', 'thickness', 'volume', 'unit',
        ])));
        $measurement->source = MeasurementSource::User;
        $measurement->confidence = null;
        $measurement->save();

        return $measurement;
    }

    /**
     * Locks the analysis in as ready for estimation (Phase 5). Allowed from
     * "completed" or "needs_review" (a human can confirm a low-confidence
     * result after checking it) — never from queued/processing/failed.
     */
    public function confirm(PlanAnalysis $analysis, User $user): PlanAnalysis
    {
        if (! in_array($analysis->status, [AnalysisStatus::Completed, AnalysisStatus::NeedsReview], true)) {
            throw new PlanAnalysisException(
                "Impossible de confirmer une analyse au statut « {$analysis->status->value} »."
            );
        }

        $analysis->update([
            'confirmed_by' => $user->id,
            'confirmed_at' => now(),
        ]);

        $this->auditLog->log('analysis.confirmed', $analysis, $user, $analysis->plan->project->organization);

        return $analysis;
    }

    /**
     * A completed analysis of a file with the same checksum, anywhere in the
     * same project — re-uploading/re-triggering the exact same document
     * shouldn't spend quota or re-run the AI provider on it (spec §19/§20).
     */
    private function findReusableAnalysis(Plan $plan): ?PlanAnalysis
    {
        return PlanAnalysis::whereIn('status', [AnalysisStatus::Completed, AnalysisStatus::NeedsReview])
            ->whereHas('plan', fn ($query) => $query
                ->where('project_id', $plan->project_id)
                ->where('checksum', $plan->checksum))
            ->latest()
            ->with('measurements')
            ->first();
    }
}
