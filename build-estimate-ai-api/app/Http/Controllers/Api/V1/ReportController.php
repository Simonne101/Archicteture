<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Estimate;
use App\Models\Report;
use App\Services\AuditLogService;
use App\Services\Report\ReportService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reports,
        private readonly AuditLogService $auditLog,
    ) {}

    public function store(Estimate $estimate): JsonResponse
    {
        $this->authorize('create', [Report::class, $estimate]);

        $report = $this->reports->start($estimate, request()->user());

        return ApiResponse::success(new ReportResource($report), 'Génération du rapport en cours.', 202);
    }

    public function show(Report $report): JsonResponse
    {
        $this->authorize('view', $report);

        return ApiResponse::success(new ReportResource($report));
    }

    /**
     * Streams the PDF through this policy-checked controller — the storage
     * path is never exposed to the client, and a user can never download
     * another organization's report simply by guessing/incrementing an ID
     * (spec §34, §64).
     */
    public function download(Report $report): StreamedResponse
    {
        $this->authorize('download', $report);

        if (! $report->storage_path || ! Storage::disk(config('build_estimate.storage_disk'))->exists($report->storage_path)) {
            abort(404, 'Le fichier du rapport est introuvable.');
        }

        $filename = 'estimation-'.Str::slug($report->estimate->project->name).'-'.$report->id.'.pdf';

        $this->auditLog->log('report.downloaded', $report, request()->user(), $report->estimate->project->organization);

        return Storage::disk(config('build_estimate.storage_disk'))->download($report->storage_path, $filename);
    }
}
