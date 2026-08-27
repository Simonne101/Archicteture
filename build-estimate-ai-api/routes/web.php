<?php

use Illuminate\Support\Facades\Route;

// This is an API-only backend — the actual product lives at
// build-estimate-ai-vite (React SPA). This route just confirms the API is
// reachable; there is no Blade/Vite frontend here.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'status' => 'ok',
]));
