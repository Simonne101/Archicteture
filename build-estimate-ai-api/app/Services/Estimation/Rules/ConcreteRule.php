<?php

namespace App\Services\Estimation\Rules;

use App\Enums\MeasurementCategory;
use App\Services\Estimation\EstimationRuleInterface;
use App\Support\UnitConverter;
use Illuminate\Support\Collection;

/**
 * Derives cement/sand/gravel quantities from the gross concrete volume of
 * confirmed wall measurements. The dosage ratios come entirely from
 * config('estimation_rules.concrete') — never hardcoded here — and are
 * explicitly non-certified defaults (spec §22).
 *
 * Known simplification: uses gross wall volume (does not subtract opening
 * volumes, and doesn't yet account for foundation/slab/column/beam
 * quantities — those need their own Measurement categories and Rules,
 * not implemented yet). Never presented as more precise than it is.
 */
class ConcreteRule implements EstimationRuleInterface
{
    public function materialCodes(): array
    {
        return ['ciment', 'sable', 'gravillon'];
    }

    public function calculate(Collection $measurements): array
    {
        $volumeM3 = $measurements
            ->where('category', MeasurementCategory::Wall)
            ->filter(fn ($m) => $m->length !== null && $m->height !== null && $m->thickness !== null)
            ->sum(function ($wall) {
                $length = UnitConverter::lengthToMeters($wall->length, $wall->unit);
                $height = UnitConverter::lengthToMeters($wall->height, $wall->unit);
                $thickness = UnitConverter::lengthToMeters($wall->thickness, $wall->unit);

                return $length * $height * $thickness;
            });

        if ($volumeM3 <= 0) {
            return [];
        }

        $ratios = config('estimation_rules.concrete');

        return [
            [
                'material_code' => 'ciment',
                'quantity' => round(($volumeM3 * $ratios['cement_kg_per_m3']) / 1000, 2), // tonnes
                'unit' => 'tonne',
                'metadata' => ['concrete_volume_m3' => round($volumeM3, 3)],
            ],
            [
                'material_code' => 'sable',
                'quantity' => round($volumeM3 * $ratios['sand_m3_per_m3'], 2),
                'unit' => 'm3',
                'metadata' => ['concrete_volume_m3' => round($volumeM3, 3)],
            ],
            [
                'material_code' => 'gravillon',
                'quantity' => round($volumeM3 * $ratios['gravel_m3_per_m3'], 2),
                'unit' => 'm3',
                'metadata' => ['concrete_volume_m3' => round($volumeM3, 3)],
            ],
        ];
    }
}
