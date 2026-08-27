<?php

namespace App\Services\Analysis;

use App\DTOs\AIAnalysisResult;
use App\Enums\MeasurementCategory;
use App\Enums\MeasurementSource;
use App\Models\PlanAnalysis;

/**
 * Turns a provider's AIAnalysisResult into: (1) a validated
 * normalized_result array (missing sections default to empty, confidence
 * clamped to [0,1]) and (2) concrete Measurement rows the estimation engine
 * (Phase 5) will read from — the AI's output is a data source to verify,
 * never the final authority (spec §17, §84).
 */
class AnalysisNormalizer
{
    public function normalize(AIAnalysisResult $result): array
    {
        return [
            'dimensions' => $result->dimensions,
            'rooms' => $result->rooms,
            'walls' => $result->walls,
            'openings' => $result->openings,
            'levels' => $result->levels,
            'areas' => $result->areas,
            'structures' => $result->structures,
            'materials_hints' => $result->materialsHints,
            'confidence_score' => max(0.0, min(1.0, $result->confidenceScore)),
            'warnings' => $result->warnings,
        ];
    }

    /**
     * Persists one Measurement row per detected room/wall/opening/level,
     * all with source=ai (never fabricated as user-confirmed).
     */
    public function createMeasurements(PlanAnalysis $analysis, array $normalized): void
    {
        foreach ($normalized['rooms'] ?? [] as $room) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Room,
                'label' => $room['label'] ?? null,
                'surface' => $room['surface'] ?? null,
                'unit' => $room['unit'] ?? 'm2',
                'source' => MeasurementSource::AI,
                'confidence' => $room['confidence'] ?? null,
            ]);
        }

        foreach ($normalized['walls'] ?? [] as $wall) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Wall,
                'label' => $wall['label'] ?? null,
                'length' => $wall['length'] ?? null,
                'height' => $wall['height'] ?? null,
                'thickness' => $wall['thickness'] ?? null,
                'unit' => $wall['unit'] ?? 'm',
                'source' => MeasurementSource::AI,
                'confidence' => $wall['confidence'] ?? null,
            ]);
        }

        foreach ($normalized['openings'] ?? [] as $opening) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Opening,
                'label' => $opening['label'] ?? null,
                'width' => $opening['width'] ?? null,
                'height' => $opening['height'] ?? null,
                'unit' => $opening['unit'] ?? 'm',
                'source' => MeasurementSource::AI,
                'confidence' => $opening['confidence'] ?? null,
            ]);
        }

        foreach ($normalized['levels'] ?? [] as $level) {
            $analysis->measurements()->create([
                'category' => MeasurementCategory::Level,
                'label' => $level['label'] ?? null,
                'height' => $level['height'] ?? null,
                'unit' => $level['unit'] ?? 'm',
                'source' => MeasurementSource::AI,
                'confidence' => $level['confidence'] ?? null,
            ]);
        }
    }
}
