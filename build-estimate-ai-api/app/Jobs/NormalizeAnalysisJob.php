<?php

namespace App\Jobs;

use App\DTOs\AIAnalysisResult;
use App\Enums\AnalysisStatus;
use App\Enums\PlanStatus;
use App\Models\PlanAnalysis;
use App\Notifications\AnalysisCompletedNotification;
use App\Notifications\AnalysisFailedNotification;
use App\Services\Analysis\AnalysisNormalizer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

class NormalizeAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(
        public PlanAnalysis $planAnalysis,
        public AIAnalysisResult $result,
    ) {}

    public function handle(AnalysisNormalizer $normalizer): void
    {
        $normalized = $normalizer->normalize($this->result);
        $confidence = $normalized['confidence_score'];
        $threshold = config('build_estimate.confidence_threshold');

        // Below the confidence threshold, the analysis is never
        // auto-accepted — a human must review and explicitly confirm it
        // (spec §14, §84).
        $status = $confidence >= $threshold ? AnalysisStatus::Completed : AnalysisStatus::NeedsReview;

        DB::transaction(function () use ($normalizer, $normalized, $status) {
            $this->planAnalysis->update([
                'status' => $status,
                'confidence_score' => $normalized['confidence_score'],
                'normalized_result' => $normalized,
                'completed_at' => now(),
            ]);

            $normalizer->createMeasurements($this->planAnalysis, $normalized);

            $this->planAnalysis->plan->update(['status' => PlanStatus::Analyzed]);
        });

        $this->planAnalysis->plan->uploader->notify(new AnalysisCompletedNotification($this->planAnalysis->fresh()));
    }

    public function failed(?Throwable $exception): void
    {
        $this->planAnalysis->update([
            'status' => AnalysisStatus::Failed,
            'error_message' => $exception?->getMessage() ?? 'Erreur inconnue durant la normalisation.',
            'completed_at' => now(),
        ]);

        $this->planAnalysis->plan->update(['status' => PlanStatus::Failed]);

        $this->planAnalysis->plan->uploader->notify(new AnalysisFailedNotification($this->planAnalysis->fresh()));
    }
}
