<?php

namespace Database\Factories;

use App\Enums\PlanStatus;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Plan>
 *
 * project_id and uploaded_by have no sensible default — always pass them
 * explicitly, e.g. Plan::factory()->create(['project_id' => ..., 'uploaded_by' => ...]).
 */
class PlanFactory extends Factory
{
    public function definition(): array
    {
        $filename = fake()->slug().'.pdf';

        return [
            'original_filename' => $filename,
            'storage_path' => 'projects/test/plans/'.Str::uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(50_000, 5_000_000),
            'checksum' => hash('sha256', Str::random(32)),
            'status' => PlanStatus::Ready,
            'page_count' => null,
        ];
    }
}
