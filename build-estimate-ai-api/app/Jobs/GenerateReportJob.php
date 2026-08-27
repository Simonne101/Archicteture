<?php

namespace App\Jobs;

use App\Enums\ReportStatus;
use App\Models\Report;
use App\Services\Report\ReportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(public Report $report) {}

    public function handle(ReportService $reports): void
    {
        $reports->generate($this->report);
    }

    public function failed(?Throwable $exception): void
    {
        $this->report->update([
            'status' => ReportStatus::Failed,
            'error_message' => $exception?->getMessage() ?? 'Erreur inconnue durant la génération du rapport.',
        ]);
    }
}
