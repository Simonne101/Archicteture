<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Explicit unit conversion for measurement values — units are never mixed
 * silently (spec §18). A value is only ever combined with another once both
 * are known to be in the same unit.
 */
class UnitConverter
{
    private const LENGTH_TO_METERS = [
        'mm' => 0.001,
        'cm' => 0.01,
        'm' => 1.0,
    ];

    public static function lengthToMeters(float $value, string $unit): float
    {
        if (! isset(self::LENGTH_TO_METERS[$unit])) {
            throw new InvalidArgumentException("Unité de longueur inconnue : [{$unit}].");
        }

        return $value * self::LENGTH_TO_METERS[$unit];
    }

    public static function surfaceToSquareMeters(float $value, string $unit): float
    {
        return match ($unit) {
            'm2', 'm²' => $value,
            'cm2', 'cm²' => $value * 0.0001,
            default => throw new InvalidArgumentException("Unité de surface inconnue : [{$unit}]."),
        };
    }
}
