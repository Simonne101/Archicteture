<?php

namespace App\Http\Resources;

use App\Models\ProjectInput;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProjectInput */
class ProjectInputResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        [$canEstimate, $missingFields] = $this->readiness();

        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'dimensions' => $this->dimensions ?? (object) [],
            'structure' => $this->structure ?? (object) [],
            'foundations' => $this->foundations ?? (object) [],
            'walls' => $this->walls ?? (object) [],
            'openings' => $this->openings ?? (object) [],
            'reinforced_concrete' => $this->reinforced_concrete ?? (object) [],
            'roofing' => $this->roofing ?? (object) [],
            'materials' => $this->materials ?? [],
            'notes' => $this->notes,
            // Whether there's enough information — from this form OR from
            // confirmed AI measurements — to run an estimation (spec §16).
            'can_estimate' => $canEstimate,
            'missing_fields' => $missingFields,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * @return array{0: bool, 1: string[]}
     */
    private function readiness(): array
    {
        $dimensions = $this->dimensions ?? [];
        $structure = $this->structure ?? [];
        $walls = $this->walls ?? [];

        $hasConfirmedMeasurements = $this->project
            ? $this->project->plans()
                ->whereHas('analyses', fn ($q) => $q->whereNotNull('confirmed_at'))
                ->exists()
            : false;

        $hasSurface = ! empty($dimensions['approximate_surface'])
            || (! empty($dimensions['building_length']) && ! empty($dimensions['building_width']));

        $missing = [];

        if (! $hasSurface && ! $hasConfirmedMeasurements) {
            $missing[] = 'dimensions.approximate_surface';
        }

        if (empty($structure['levels'])) {
            $missing[] = 'structure.levels';
        }

        if (! $hasConfirmedMeasurements && (empty($walls['height']) || empty($walls['thickness']))) {
            $missing[] = 'walls.height';
        }

        return [$missing === [], $missing];
    }
}
