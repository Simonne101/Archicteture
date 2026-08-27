<?php

use App\Http\Controllers\Api\V1\AnalysisAccessController;
use App\Http\Controllers\Api\V1\AnalysisController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DemoController;
use App\Http\Controllers\Api\V1\EstimateController;
use App\Http\Controllers\Api\V1\MaterialController;
use App\Http\Controllers\Api\V1\MetaController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ProjectInputController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::middleware('throttle:auth')->group(function () {
            Route::post('register', [AuthController::class, 'register']);
            Route::post('login', [AuthController::class, 'login']);
            Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('reset-password', [AuthController::class, 'resetPassword']);
        });

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    Route::get('subscription-plans', [SubscriptionPlanController::class, 'index']);
    Route::get('meta', [MetaController::class, 'index']);

    // Public showcase — deliberately outside auth:sanctum (spec: a visitor
    // must be able to view demos without creating an account).
    Route::get('demos', [DemoController::class, 'index']);
    Route::get('demos/{slug}', [DemoController::class, 'show']);
    Route::get('demos/{slug}/report/download', [DemoController::class, 'downloadReport'])
        ->name('demos.report.download');

    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('organizations', OrganizationController::class)->only(['index', 'store', 'show']);
        Route::get('organizations/{organization}/dashboard', [DashboardController::class, 'show']);
        Route::get('organizations/{organization}/subscription', [SubscriptionController::class, 'show']);
        Route::post('organizations/{organization}/subscription', [SubscriptionController::class, 'store']);
        Route::post('organizations/{organization}/subscription/cancel', [SubscriptionController::class, 'cancel']);

        Route::get('materials', [MaterialController::class, 'index']);

        Route::apiResource('projects', ProjectController::class)->except(['create', 'edit']);
        Route::get('projects/{project}/input', [ProjectInputController::class, 'show']);
        Route::put('projects/{project}/input', [ProjectInputController::class, 'upsert']);
        Route::post('projects/{project}/input/analyze', [ProjectInputController::class, 'analyze'])
            ->middleware('throttle:analysis');
        Route::get('projects/{project}/analysis-access', [AnalysisAccessController::class, 'show']);

        Route::apiResource('projects.plans', PlanController::class)
            ->shallow()
            ->only(['index', 'store', 'show', 'destroy'])
            ->middlewareFor('store', 'throttle:uploads');

        Route::post('plans/{plan}/analyze', [AnalysisController::class, 'analyze'])
            ->middleware('throttle:analysis');
        Route::get('analyses/{analysis}', [AnalysisController::class, 'show']);
        Route::post('analyses/{analysis}/review', [AnalysisController::class, 'review']);
        Route::post('analyses/{analysis}/confirm', [AnalysisController::class, 'confirm']);
        Route::patch('analyses/{analysis}/measurements/{measurement}', [AnalysisController::class, 'updateMeasurement']);

        Route::apiResource('projects.estimates', EstimateController::class)
            ->shallow()
            ->only(['index', 'store', 'show']);

        Route::post('estimates/{estimate}/reports', [ReportController::class, 'store'])
            ->middleware('throttle:reports');
        Route::get('reports/{report}', [ReportController::class, 'show']);
        Route::get('reports/{report}/download', [ReportController::class, 'download'])
            ->name('reports.download');
    });

});
