<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Estimate\CreateEstimateRequest;
use App\Http\Resources\EstimateResource;
use App\Models\Estimate;
use App\Models\PlanAnalysis;
use App\Models\Project;
use App\Services\Estimation\EstimationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstimateController extends Controller
{
    public function __construct(private readonly EstimationService $estimation) {}

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $estimates = $project->estimates()
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ApiResponse::paginated(EstimateResource::collection($estimates));
    }

    public function store(CreateEstimateRequest $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Estimate::class, $project]);

        $analysis = PlanAnalysis::findOrFail($request->validated('analysis_id'));

        if ($analysis->plan->project_id !== $project->id) {
            abort(404);
        }

        $estimate = $this->estimation->start($analysis, $request->user());

        return ApiResponse::success(new EstimateResource($estimate), 'Génération de l\'estimation en cours.', 202);
    }

    public function show(Estimate $estimate): JsonResponse
    {
        $this->authorize('view', $estimate);

        $estimate->load('items.material');

        return ApiResponse::success(new EstimateResource($estimate));
    }
}
