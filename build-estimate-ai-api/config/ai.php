<?php

use App\Services\AI\MockAIProvider;

return [

    /*
    |--------------------------------------------------------------------------
    | Active AI provider
    |--------------------------------------------------------------------------
    |
    | "mock" requires no API key and is what tests/seeders/CI use. Real
    | providers (OpenAI, Anthropic, Gemini) plug in here later without any
    | other part of the app changing, since everything depends only on
    | App\Services\AI\AIProviderInterface (spec §16).
    |
    */

    'provider' => env('AI_PROVIDER', 'mock'),

    'api_key' => env('AI_API_KEY'),

    'model' => env('AI_MODEL'),

    'providers' => [
        'mock' => MockAIProvider::class,
        // 'openai' => \App\Services\AI\OpenAIProvider::class,
        // 'anthropic' => \App\Services\AI\AnthropicProvider::class,
        // 'gemini' => \App\Services\AI\GeminiProvider::class,
    ],

];
