<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Analysis\ReviewAnalysisRequest;
use App\Http\Requests\Analysis\UpdateMeasurementRequest;
use App\Http\Resources\MeasurementResource;
use App\Http\Resources\PlanAnalysisResource;
use App\Models\Measurement;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Services\Analysis\PlanAnalysisService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalysisController extends Controller
{
    public function __construct(private readonly PlanAnalysisService $analyses) {}

    public function analyze(Request $request, Plan $plan): JsonResponse
    {
        $this->authorize('update', $plan->project);

        $analysis = $this->analyses->start($plan, $request->user(), $request->boolean('force'));

        return ApiResponse::success(new PlanAnalysisResource($analysis), 'Analyse en cours de traitement.', 202);
    }

    public function show(PlanAnalysis $analysis): JsonResponse
    {
        $this->authorize('view', $analysis);

        $analysis->load('measurements');

        return ApiResponse::success(new PlanAnalysisResource($analysis));
    }

    public function review(ReviewAnalysisRequest $request, PlanAnalysis $analysis): JsonResponse
    {
        $this->authorize('review', $analysis);

        $analysis = $this->analyses->review(
            $analysis,
            $request->validated('measurements', []),
            $request->user()
        );

        return ApiResponse::success(new PlanAnalysisResource($analysis), 'Analyse revue avec succès.');
    }

    public function confirm(PlanAnalysis $analysis): JsonResponse
    {
        $this->authorize('confirm', $analysis);

        $analysis = $this->analyses->confirm($analysis, request()->user());

        return ApiResponse::success(new PlanAnalysisResource($analysis), 'Analyse confirmée avec succès.');
    }

    public function updateMeasurement(UpdateMeasurementRequest $request, PlanAnalysis $analysis, Measurement $measurement): JsonResponse
    {
        $this->authorize('review', $analysis);

        if ($measurement->plan_analysis_id !== $analysis->id) {
            abort(404);
        }

        $measurement = $this->analyses->updateMeasurement($measurement, $request->validated());

        return ApiResponse::success(new MeasurementResource($measurement), 'Mesure mise à jour avec succès.');
    }
}
