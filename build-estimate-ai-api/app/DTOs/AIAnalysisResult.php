<?php

namespace App\DTOs;

/**
 * The one normalized shape every AI provider must return (spec §17). The
 * rest of the application depends only on this — never on a provider's raw
 * response format — so swapping providers never ripples outward.
 */
final class AIAnalysisResult
{
    public function __construct(
        public readonly array $dimensions = [],
        public readonly array $rooms = [],
        public readonly array $walls = [],
        public readonly array $openings = [],
        public readonly array $levels = [],
        public readonly array $areas = [],
        public readonly array $structures = [],
        public readonly array $materialsHints = [],
        public readonly float $confidenceScore = 0.0,
        public readonly array $warnings = [],
        /** The provider's own raw response, kept for audit/debugging — never used elsewhere. */
        public readonly array $raw = [],
    ) {}

    public function toArray(): array
    {
        return [
            'dimensions' => $this->dimensions,
            'rooms' => $this->rooms,
            'walls' => $this->walls,
            'openings' => $this->openings,
            'levels' => $this->levels,
            'areas' => $this->areas,
            'structures' => $this->structures,
            'materials_hints' => $this->materialsHints,
            'confidence_score' => $this->confidenceScore,
            'warnings' => $this->warnings,
        ];
    }
}
