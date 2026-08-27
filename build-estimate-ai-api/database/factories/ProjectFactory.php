<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * organization_id and created_by have no sensible default (Organization
     * has no factory of its own) — always pass them explicitly when using
     * this factory, e.g. Project::factory()->create(['organization_id' => ..., 'created_by' => ...]).
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'project_type' => fake()->randomElement(['résidentiel', 'commercial', 'industriel']),
            'location' => fake()->city(),
            'country_code' => 'BJ',
            'currency' => 'XOF',
            'status' => ProjectStatus::Draft,
            'metadata' => null,
        ];
    }
}
