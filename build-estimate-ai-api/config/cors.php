<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Built from the same host:port list as SANCTUM_STATEFUL_DOMAINS, so a
    // local Vite dev server that lands on a fallback port (5173 already
    // taken → 5174, 5175...) still gets a matching CORS origin instead of
    // being silently blocked while auth still "looks" configured right.
    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        [config('app.frontend_url')],
        array_map(
            fn ($domain) => 'http://'.$domain,
            explode(',', env('SANCTUM_STATEFUL_DOMAINS', ''))
        )
    )))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
