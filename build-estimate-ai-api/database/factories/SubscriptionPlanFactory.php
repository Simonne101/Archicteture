<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'name' => ucfirst($slug),
            'slug' => $slug,
            'price_monthly' => fake()->randomFloat(2, 0, 200),
            'price_yearly' => fake()->randomFloat(2, 0, 2000),
            'currency' => 'XOF',
            'limits' => [
                'plans_per_month' => 3,
                'analyses_per_month' => 3,
                'reports_per_month' => 3,
                'storage_mb' => 200,
                'team_members' => 1,
            ],
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
