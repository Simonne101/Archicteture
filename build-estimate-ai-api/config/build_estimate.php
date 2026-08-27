<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Uploads
    |--------------------------------------------------------------------------
    */

    'max_upload_size_kb' => (int) env('BUILD_ESTIMATE_MAX_UPLOAD_KB', 25 * 1024), // 25 MB

    'supported_formats' => array_filter(explode(',', env(
        'BUILD_ESTIMATE_SUPPORTED_FORMATS',
        'pdf,jpg,jpeg,png'
    ))),

    /*
    |--------------------------------------------------------------------------
    | Construction types
    |--------------------------------------------------------------------------
    | Extensible on purpose (spec: "prévoir la possibilité d'ajouter d'autres
    | types ultérieurement") — a config list, not a rigid PHP enum, so a new
    | type is a one-line config change, not a migration.
    */

    'construction_types' => array_filter(explode(',', env(
        'BUILD_ESTIMATE_CONSTRUCTION_TYPES',
        'maison_individuelle,villa,immeuble,bureau,commerce,etablissement_public,autre'
    ))),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    'default_currency' => env('BUILD_ESTIMATE_DEFAULT_CURRENCY', 'XOF'),

    'supported_currencies' => array_filter(explode(',', env(
        'BUILD_ESTIMATE_SUPPORTED_CURRENCIES',
        'XOF,EUR,USD'
    ))),

    // Only used as a fallback for internal callers that build a project
    // without going through the real (country_code-required) API endpoint
    // — see ProjectService::create(). Never applied to a real user request.
    'default_country' => env('BUILD_ESTIMATE_DEFAULT_COUNTRY', 'BJ'),

    /*
    |--------------------------------------------------------------------------
    | Analysis pipeline
    |--------------------------------------------------------------------------
    */

    'analysis_timeout' => (int) env('BUILD_ESTIMATE_ANALYSIS_TIMEOUT', 120), // seconds

    // Below this score, an analysis is forced into "needs_review" instead of
    // being auto-accepted. See app/Enums/AnalysisStatus.php.
    'confidence_threshold' => (float) env('BUILD_ESTIMATE_CONFIDENCE_THRESHOLD', 0.85),

    /*
    |--------------------------------------------------------------------------
    | Storage / Queue
    |--------------------------------------------------------------------------
    */

    'storage_disk' => env('BUILD_ESTIMATE_STORAGE_DISK', 'local'),

    'queue_name' => env('BUILD_ESTIMATE_QUEUE', 'default'),

    /*
    |--------------------------------------------------------------------------
    | Calculation versioning
    |--------------------------------------------------------------------------
    | Bumped whenever the material calculation rules in
    | app/Services/Estimation/Rules change in a way that affects output.
    */

    'calculation_version' => env('BUILD_ESTIMATE_CALCULATION_VERSION', '1.0'),

];
