<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Plan\UploadPlanRequest;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use App\Models\Project;
use App\Services\PlanService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function __construct(private readonly PlanService $plans) {}

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $plans = $project->plans()
            ->with('uploader')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ApiResponse::paginated(PlanResource::collection($plans));
    }

    public function store(UploadPlanRequest $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Plan::class, $project]);

        $plan = $this->plans->upload($request->file('file'), $project, $request->user());
        $plan->load('uploader');

        return ApiResponse::success(new PlanResource($plan), 'Plan téléchargé avec succès.', 201);
    }

    public function show(Plan $plan): JsonResponse
    {
        $this->authorize('view', $plan);

        $plan->load('uploader');

        return ApiResponse::success(new PlanResource($plan));
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $this->authorize('delete', $plan);

        $this->plans->delete($plan);

        return ApiResponse::success(null, 'Plan supprimé avec succès.');
    }
}
