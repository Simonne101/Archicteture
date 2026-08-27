<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Seeds the plans defined in config/subscription_plans.php. Plan rows
     * are the source of truth at runtime (editable without a deploy); the
     * config file only supplies these starting values.
     */
    public function run(): void
    {
        $sortOrder = 0;

        foreach (config('subscription_plans') as $slug => $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $plan['name'],
                    'price_monthly' => $plan['price_monthly'],
                    'price_yearly' => $plan['price_yearly'],
                    'currency' => config('build_estimate.default_currency'),
                    'limits' => $plan['limits'],
                    'is_active' => true,
                    'sort_order' => $sortOrder++,
                ]
            );
        }
    }
}
