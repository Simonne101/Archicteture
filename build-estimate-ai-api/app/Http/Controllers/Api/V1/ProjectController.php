<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Organization;
use App\Models\Project;
use App\Services\ProjectService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projects) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $projects = $this->projects->listForUser(
            $request->user(),
            $request->only(['organization_id', 'status', 'search', 'sort', 'direction']),
            $request->integer('per_page', 15)
        );

        return ApiResponse::paginated(ProjectResource::collection($projects));
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $organizationId = $request->validated('organization_id');

        $organization = $organizationId
            ? Organization::findOrFail($organizationId)
            : $request->user()->defaultOrganization();

        if (! $organization) {
            return ApiResponse::error(
                'Aucune organisation associée à ce compte. Contactez le support.',
                [],
                422
            );
        }

        $this->authorize('create', [Project::class, $organization]);

        $project = $this->projects->create($request->validated(), $organization, $request->user());
        $project->load(['organization', 'creator']);

        return ApiResponse::success(new ProjectResource($project), 'Projet créé avec succès.', 201);
    }

    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->load(['organization', 'creator']);

        return ApiResponse::success(new ProjectResource($project));
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project = $this->projects->update($project, $request->validated());
        $project->load(['organization', 'creator']);

        return ApiResponse::success(new ProjectResource($project), 'Projet mis à jour avec succès.');
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $this->projects->delete($project);

        return ApiResponse::success(null, 'Projet supprimé avec succès.');
    }
}
