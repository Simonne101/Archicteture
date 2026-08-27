<?php

namespace App\Jobs;

use App\Enums\EstimateStatus;
use App\Models\Estimate;
use App\Services\Estimation\EstimationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateEstimateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(public Estimate $estimate) {}

    public function handle(EstimationService $estimation): void
    {
        $estimation->calculate($this->estimate);
    }

    public function failed(?Throwable $exception): void
    {
        $this->estimate->update([
            'status' => EstimateStatus::Failed,
            'error_message' => $exception?->getMessage() ?? 'Erreur inconnue durant le calcul de l\'estimation.',
        ]);
    }
}
