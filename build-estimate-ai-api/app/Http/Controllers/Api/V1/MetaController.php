<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Support\ApiResponse;
use App\Support\CurrencyRegistry;
use Illuminate\Http\JsonResponse;

class MetaController extends Controller
{
    /**
     * Reference data the frontend needs to render forms (dropdown options,
     * upload constraints) without hardcoding values that already live in
     * backend config — so a config change never requires a frontend deploy.
     */
    public function index(): JsonResponse
    {
        return ApiResponse::success([
            'construction_types' => config('build_estimate.construction_types'),
            'supported_currencies' => config('build_estimate.supported_currencies'),
            'default_currency' => config('build_estimate.default_currency'),
            'supported_plan_formats' => config('build_estimate.supported_formats'),
            'max_upload_size_kb' => config('build_estimate.max_upload_size_kb'),
            // Countries drive local unit conventions (sac, roue, barre...),
            // never a price — the material-estimation engine has no
            // financial concept of currency (business rule: quantities
            // only). `supported_currencies`/`default_currency` above are
            // unrelated: they belong to subscription/billing, not materials.
            'countries' => collect(CurrencyRegistry::countries())
                ->map(fn ($country, $code) => ['code' => $code, ...$country])
                ->values(),
            // Units are backend-managed reference data too (spec Règle 12 —
            // never hardcode unit lists in React components).
            'units' => Unit::where('active', true)->orderBy('type')->orderBy('name')->get(['code', 'name', 'symbol', 'type']),
        ]);
    }
}
