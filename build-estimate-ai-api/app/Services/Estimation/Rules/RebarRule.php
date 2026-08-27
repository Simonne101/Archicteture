<?php

namespace App\Services\Estimation\Rules;

use App\Enums\MeasurementCategory;
use App\Services\Estimation\EstimationRuleInterface;
use App\Support\UnitConverter;
use Illuminate\Support\Collection;

/**
 * Derives rebar ("fer à béton") bar counts per diameter from total wall
 * surface. The kg/m² ratio and diameter distribution are non-certified
 * config defaults (spec §22) — only the bar-weight-from-diameter
 * calculation itself is real physics (cylinder volume × steel density),
 * not an invented BTP formula.
 *
 * Known simplification: based on wall surface only — doesn't yet account
 * for slabs/columns/beams (not implemented, spec §21's fuller rule set).
 */
class RebarRule implements EstimationRuleInterface
{
    public function materialCodes(): array
    {
        return collect(config('estimation_rules.rebar.diameter_distribution_mm'))
            ->keys()
            ->map(fn (int $mm) => "fer-{$mm}mm")
            ->all();
    }

    public function calculate(Collection $measurements): array
    {
        $surfaceM2 = $measurements
            ->where('category', MeasurementCategory::Wall)
            ->filter(fn ($m) => $m->length !== null && $m->height !== null)
            ->sum(function ($wall) {
                $length = UnitConverter::lengthToMeters($wall->length, $wall->unit);
                $height = UnitConverter::lengthToMeters($wall->height, $wall->unit);

                return $length * $height;
            });

        if ($surfaceM2 <= 0) {
            return [];
        }

        $config = config('estimation_rules.rebar');
        $totalKg = $surfaceM2 * $config['kg_per_m2_wall_surface'];
        $barLength = $config['standard_bar_length_m'];
        $steelDensity = $config['steel_density_kg_per_m3'];

        $items = [];

        foreach ($config['diameter_distribution_mm'] as $diameterMm => $share) {
            $kgForDiameter = $totalKg * $share;

            $radiusM = ($diameterMm / 1000) / 2;
            $barVolumeM3 = M_PI * ($radiusM ** 2) * $barLength;
            $barWeightKg = $barVolumeM3 * $steelDensity;

            $bars = $barWeightKg > 0 ? (int) ceil($kgForDiameter / $barWeightKg) : 0;

            if ($bars <= 0) {
                continue;
            }

            $items[] = [
                'material_code' => "fer-{$diameterMm}mm",
                'quantity' => $bars,
                'unit' => 'barre',
                'metadata' => [
                    'wall_surface_m2' => round($surfaceM2, 3),
                    'bar_weight_kg' => round($barWeightKg, 3),
                ],
            ];
        }

        return $items;
    }
}
