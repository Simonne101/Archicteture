<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Centralizes the {success, data, message} / {success, message, errors}
 * response envelope used across every API endpoint (see section 38 of the spec).
 */
class ApiResponse
{
    public static function success(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return response()->json(array_filter([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], fn ($value, $key) => $key !== 'message' || $value !== null, ARRAY_FILTER_USE_BOTH), $status);
    }

    /**
     * Like success(), but for a paginated resource collection: preserves the
     * "links"/"meta" pagination info that would otherwise be lost if the
     * collection were nested as a plain "data" value (see section 47/48 —
     * every list endpoint must expose pagination info to the frontend).
     */
    public static function paginated(AnonymousResourceCollection $collection, ?string $message = null): JsonResponse
    {
        return self::success($collection->response()->getData(true), $message);
    }

    public static function error(string $message, array $errors = [], int $status = 422): JsonResponse
    {
        return response()->json(array_filter([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], fn ($value, $key) => $key !== 'errors' || $value !== [], ARRAY_FILTER_USE_BOTH), $status);
    }
}
