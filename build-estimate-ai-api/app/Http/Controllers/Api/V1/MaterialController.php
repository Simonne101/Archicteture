<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class MaterialController extends Controller
{
    /**
     * The active material catalog — read-only reference data any
     * authenticated user can see (needed to populate selection UIs, e.g.
     * project_inputs.materials). Catalog management stays an admin/seeder
     * concern, not exposed here.
     */
    public function index(): JsonResponse
    {
        $materials = Material::where('active', true)->orderBy('name')->get();

        return ApiResponse::success(MaterialResource::collection($materials));
    }
}
