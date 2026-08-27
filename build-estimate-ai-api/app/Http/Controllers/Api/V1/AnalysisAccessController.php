<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UsageMetric;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\UsageService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalysisAccessController extends Controller
{
    public function __construct(private readonly UsageService $usage) {}

    /**
     * Lets the frontend know, before it even tries, whether the current
     * user can run an analysis right now — and why not, if not. A demo or
     * admin account always gets {allowed: true, unlimited: true}; never a
     * fabricated large number (spec §13: unlimited is a boolean, not
     * remaining=999999).
     */
    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $user = $request->user();

        return ApiResponse::success([
            'account_type' => $user->account_type->value,
            'analysis' => $this->usage->accessFor($project->organization, UsageMetric::AnalysesRun, $user),
        ]);
    }
}
