<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectInput\UpsertProjectInputRequest;
use App\Http\Resources\PlanAnalysisResource;
use App\Http\Resources\ProjectInputResource;
use App\Models\Project;
use App\Models\ProjectInput;
use App\Services\Analysis\ManualAnalysisService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ProjectInputController extends Controller
{
    public function __construct(private readonly ManualAnalysisService $manualAnalysis) {}

    /**
     * Always returns 200 with an (possibly empty) input, even if the project
     * has never had one saved — the frontend form always has something to
     * render instead of branching on 404.
     */
    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $input = $project->input ?? (new ProjectInput(['project_id' => $project->id]))
            ->setRelation('project', $project);

        return ApiResponse::success(new ProjectInputResource($input));
    }

    public function upsert(UpsertProjectInputRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $input = ProjectInput::updateOrCreate(
            ['project_id' => $project->id],
            $request->validated()
        );
        $input->setRelation('project', $project);

        return ApiResponse::success(new ProjectInputResource($input), 'Informations du projet enregistrées.');
    }

    /**
     * Produces a confirmed analysis directly from the technical form,
     * without requiring a plan upload — reuses the exact same
     * Plan/PlanAnalysis/Measurement shape the AI pipeline produces, so
     * everything downstream (estimation, report) works unchanged.
     */
    public function analyze(Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $input = $project->input;

        if (! $input) {
            return ApiResponse::error(
                "Renseignez d'abord les informations du projet avant de lancer une estimation manuelle.",
                [],
                422
            );
        }

        $analysis = $this->manualAnalysis->createFromInput($project, $input, request()->user());

        return ApiResponse::success(new PlanAnalysisResource($analysis), 'Analyse manuelle créée avec succès.', 201);
    }
}
