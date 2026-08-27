<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstimateResource;
use App\Http\Resources\ProjectResource;
use App\Models\Estimate;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\Report;
use App\Services\UsageService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private readonly UsageService $usage) {}

    public function show(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $projectIds = $organization->projects()->pluck('id');

        return ApiResponse::success([
            'projects_count' => $projectIds->count(),
            'plans_count' => Plan::whereIn('project_id', $projectIds)->count(),
            'analyses_count' => PlanAnalysis::whereHas('plan', fn ($q) => $q->whereIn('project_id', $projectIds))->count(),
            'estimates_count' => Estimate::whereIn('project_id', $projectIds)->count(),
            'reports_count' => Report::whereHas('estimate', fn ($q) => $q->whereIn('project_id', $projectIds))->count(),
            'recent_projects' => ProjectResource::collection(
                $organization->projects()->latest()->take(5)->get()
            ),
            'recent_estimates' => EstimateResource::collection(
                Estimate::whereIn('project_id', $projectIds)->latest()->take(5)->get()
            ),
            'usage' => $this->usage->summary($organization),
        ]);
    }
}
