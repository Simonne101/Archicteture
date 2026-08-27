<?php

namespace App\Services\Report;

use App\Enums\ReportStatus;
use App\Enums\UsageMetric;
use App\Jobs\GenerateReportJob;
use App\Models\Estimate;
use App\Models\Report;
use App\Models\User;
use App\Notifications\ReportReadyNotification;
use App\Services\Estimation\UnitConversionService;
use App\Services\UsageService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReportService
{
    public function __construct(
        private readonly UsageService $usage,
        private readonly UnitConversionService $units,
    ) {}

    /**
     * Creates the Report immediately (pollable ID) and queues the actual
     * PDF generation — same async pattern as analysis/estimation (spec §29).
     */
    public function start(Estimate $estimate, User $generator): Report
    {
        $organization = $estimate->project->organization;
        $this->usage->ensureCanConsume($organization, UsageMetric::ReportsGenerated, actor: $generator);

        $report = Report::create([
            'estimate_id' => $estimate->id,
            'generated_by' => $generator->id,
            'status' => ReportStatus::Processing,
        ]);

        $this->usage->increment($organization, UsageMetric::ReportsGenerated);

        GenerateReportJob::dispatch($report);

        return $report;
    }

    /**
     * Renders a real, server-generated PDF from the estimate data — never a
     * renamed/fake file (spec §33).
     */
    public function generate(Report $report): void
    {
        $estimate = $report->estimate()->with([
            'project.organization', 'plan', 'analysis', 'creator', 'items.material',
        ])->firstOrFail();

        // Locally-relevant unit equivalents (e.g. tonnes → sacs) — a
        // quantity conversion, computed once here via the same centralized
        // service the API uses, never a price (business rule: quantities
        // only, spec §12).
        $equivalents = [];
        if ($estimate->country_code) {
            foreach ($estimate->items as $item) {
                if ($item->material && $item->quantity_base !== null) {
                    $equivalents[$item->id] = $this->units->availableConversions(
                        $item->material,
                        (float) $item->quantity_base,
                        $estimate->country_code,
                    );
                }
            }
        }

        $pdf = Pdf::loadView('reports.estimate', [
            'estimate' => $estimate,
            'project' => $estimate->project,
            'plan' => $estimate->plan,
            'equivalents' => $equivalents,
            'generatedAt' => now(),
        ])->setPaper('a4');

        $disk = config('build_estimate.storage_disk');
        $path = "projects/{$estimate->project_id}/reports/".Str::uuid()->toString().'.pdf';
        $content = $pdf->output();

        Storage::disk($disk)->put($path, $content);

        $report->update([
            'status' => ReportStatus::Completed,
            'storage_path' => $path,
            'file_size' => strlen($content),
        ]);

        $report->generator->notify(new ReportReadyNotification($report->fresh()));
    }
}
