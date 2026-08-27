<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Services\OrganizationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function __construct(private readonly OrganizationService $organizations) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Organization::class);

        $organizations = $request->user()
            ->organizations()
            ->with('users')
            ->paginate($request->integer('per_page', 15));

        return ApiResponse::paginated(OrganizationResource::collection($organizations));
    }

    public function store(StoreOrganizationRequest $request): JsonResponse
    {
        $this->authorize('create', Organization::class);

        $organization = $this->organizations->create($request->validated(), $request->user());
        $organization->load('users');

        return ApiResponse::success(new OrganizationResource($organization), 'Organisation créée avec succès.', 201);
    }

    public function show(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $organization->load('users');

        return ApiResponse::success(new OrganizationResource($organization));
    }
}
