<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstimateItemResource;
use App\Http\Resources\MeasurementResource;
use App\Models\Project;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Public, unauthenticated endpoints for the "Voir une démo" showcase
 * (spec §13/§26) — every query is scoped to is_demo=true, so this can never
 * expose a real user's project regardless of what's requested. Deliberately
 * separate from ProjectController/ReportController rather than adding
 * "if public demo" branches to the real, policy-guarded endpoints.
 */
class DemoController extends Controller
{
    public function index(): JsonResponse
    {
        $demos = Project::where('is_demo', true)
            ->whereNotNull('demo_slug')
            ->with('estimates')
            ->orderBy('created_at')
            ->get();

        return ApiResponse::success($demos->map(fn (Project $project) => [
            'slug' => $project->demo_slug,
            'name' => $project->name,
            'description' => $project->description,
            'project_type' => $project->project_type,
            'location' => $project->location,
        ]));
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::where('is_demo', true)
            ->where('demo_slug', $slug)
            ->with(['plans', 'estimates.items.material', 'estimates.analysis.measurements', 'estimates.reports'])
            ->firstOrFail();

        $plan = $project->plans->first();
        $estimate = $project->estimates->first();
        $analysis = $estimate?->analysis;
        $report = $estimate?->reports->first();

        return ApiResponse::success([
            'slug' => $project->demo_slug,
            'name' => $project->name,
            'description' => $project->description,
            'project_type' => $project->project_type,
            'location' => $project->location,
            'plan' => $plan ? [
                'original_filename' => $plan->original_filename,
                'status' => $plan->status->value,
            ] : null,
            'analysis' => $analysis ? [
                'status' => $analysis->status->value,
                'confidence_score' => $analysis->confidence_score,
                'measurements' => MeasurementResource::collection($analysis->measurements),
            ] : null,
            'estimate' => $estimate ? [
                'status' => $estimate->status->value,
                'items' => EstimateItemResource::collection($estimate->items),
                'certified' => false,
                'warning' => 'Résultat de démonstration — ratios par défaut non certifiés par un professionnel du BTP.',
            ] : null,
            'report' => $report ? [
                'status' => $report->status->value,
                'download_url' => $report->status->value === 'completed'
                    ? route('demos.report.download', $project->demo_slug)
                    : null,
            ] : null,
        ]);
    }

    public function downloadReport(string $slug): StreamedResponse
    {
        $project = Project::where('is_demo', true)
            ->where('demo_slug', $slug)
            ->with('estimates.reports')
            ->firstOrFail();

        $report = $project->estimates->first()?->reports->first();

        if (! $report || ! $report->storage_path || ! Storage::disk(config('build_estimate.storage_disk'))->exists($report->storage_path)) {
            abort(404, 'Le rapport de démonstration est introuvable.');
        }

        $filename = 'demo-'.Str::slug($project->name).'.pdf';

        return Storage::disk(config('build_estimate.storage_disk'))->download($report->storage_path, $filename);
    }
}
