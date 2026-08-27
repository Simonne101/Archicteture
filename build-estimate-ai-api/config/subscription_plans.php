<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default subscription plans
    |--------------------------------------------------------------------------
    |
    | Seeded by Database\Seeders\SubscriptionPlanSeeder. Plans themselves
    | live in the subscription_plans table (so they can be edited without a
    | deploy); this file only supplies the starting values. A limit key
    | missing/null means unlimited for that dimension.
    |
    */

    'free' => [
        'name' => 'Gratuit',
        'price_monthly' => 0,
        'price_yearly' => 0,
        'limits' => [
            'plans_per_month' => 3,
            'analyses_per_month' => 3,
            'reports_per_month' => 3,
            'storage_mb' => 200,
            'team_members' => 1,
        ],
    ],

    'pro' => [
        'name' => 'Pro',
        'price_monthly' => 29,
        'price_yearly' => 290,
        'limits' => [
            'plans_per_month' => 30,
            'analyses_per_month' => 30,
            'reports_per_month' => 30,
            'storage_mb' => 5120,
            'team_members' => 5,
        ],
    ],

    'business' => [
        'name' => 'Business',
        'price_monthly' => 99,
        'price_yearly' => 990,
        'limits' => [
            'plans_per_month' => null,
            'analyses_per_month' => null,
            'reports_per_month' => null,
            'storage_mb' => 51200,
            'team_members' => null,
        ],
    ],

];
