<?php

namespace App\Jobs;

use App\Enums\AnalysisStatus;
use App\Enums\PlanStatus;
use App\Models\PlanAnalysis;
use App\Notifications\AnalysisFailedNotification;
use App\Services\AI\AIProviderInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class AnalyzePlanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(public PlanAnalysis $planAnalysis) {}

    public function handle(AIProviderInterface $aiProvider): void
    {
        $this->planAnalysis->update([
            'status' => AnalysisStatus::Processing,
            'started_at' => now(),
        ]);

        try {
            $result = $aiProvider->analyzePlan($this->planAnalysis->plan);
        } catch (Throwable $e) {
            $this->fail($e);

            return;
        }

        $this->planAnalysis->update(['raw_result' => $result->toArray()]);

        NormalizeAnalysisJob::dispatch($this->planAnalysis, $result);
    }

    /**
     * Never leaves the plan/analysis stuck in "processing" — and never
     * fabricates an estimate from a failed analysis (spec §83).
     */
    public function failed(?Throwable $exception): void
    {
        $this->planAnalysis->update([
            'status' => AnalysisStatus::Failed,
            'error_message' => $exception?->getMessage() ?? 'Erreur inconnue durant l\'analyse.',
            'completed_at' => now(),
        ]);

        $this->planAnalysis->plan->update(['status' => PlanStatus::Failed]);

        $this->planAnalysis->plan->uploader->notify(new AnalysisFailedNotification($this->planAnalysis->fresh()));
    }
}
