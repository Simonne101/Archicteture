<?php

use App\Exceptions\EstimationException;
use App\Exceptions\InsufficientUsageException;
use App\Exceptions\PlanAnalysisException;
use App\Exceptions\ReportGenerationException;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Les données envoyées sont invalides.', $e->errors(), 422);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Authentification requise.', [], 401);
            }
        });

        // Laravel's Handler::prepareException() converts AuthorizationException
        // (no explicit status) into AccessDeniedHttpException, and
        // ModelNotFoundException into NotFoundHttpException, *before* render()
        // callbacks run — so those are the types we must actually catch here.
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error($e->getMessage() ?: 'Action non autorisée.', [], 403);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Ressource introuvable.', [], 404);
            }
        });

        // Domain/business-rule exceptions (spec §52) — always a clean 4xx
        // JSON error, never a raw stack trace.
        $exceptions->render(function (PlanAnalysisException|EstimationException|ReportGenerationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error($e->getMessage(), [], 422);
            }
        });

        $exceptions->render(function (InsufficientUsageException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error($e->getMessage(), [], 402);
            }
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') || app()->hasDebugModeEnabled()) {
                return null;
            }

            report($e);

            return ApiResponse::error('Une erreur inattendue est survenue.', [], 500);
        });
    })->create();
