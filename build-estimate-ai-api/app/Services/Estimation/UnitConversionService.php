<?php

namespace App\Services\Estimation;

use App\Models\Material;
use App\Models\Unit;
use App\Models\UnitConversion;

/**
 * Bridges the physical unit an estimation Rule calculates in (tonne, m³...)
 * to the commercial/local unit a project's market actually buys in (sac,
 * roue...) — spec: never invent a conversion factor. A country/city with no
 * configured conversion for a material simply gets its physical quantity
 * back, explicitly flagged as "not configured" — never a guessed number.
 */
class UnitConversionService
{
    /**
     * @return array{
     *   quantity_base: float, base_unit: string,
     *   quantity_display: float, display_unit: string,
     *   display_unit_configured: bool, verified: bool, notes: ?string,
     * }
     */
    public function resolve(Material $material, float $baseQuantity, string $baseUnitCode, string $countryCode, ?string $city = null): array
    {
        $conversion = $this->findConversion($material, $baseUnitCode, $countryCode, $city);

        if (! $conversion) {
            return [
                'quantity_base' => $baseQuantity,
                'base_unit' => $baseUnitCode,
                'quantity_display' => $baseQuantity,
                'display_unit' => $baseUnitCode,
                'display_unit_configured' => false,
                'verified' => true, // the physical unit itself isn't a guess
                'notes' => null,
            ];
        }

        // factor means "1 commercial unit = factor physical units" (e.g. 1
        // sac = 0.05 tonne) — dividing converts physical → commercial.
        // Commercial units are discrete, purchasable items (you can't buy
        // 0.3 of a bag) — rounding up is physical reality, not a guess,
        // exactly like RebarRule already rounds bar counts up.
        $displayQuantity = ceil(($baseQuantity / $conversion->factor) * 100) / 100;

        return [
            'quantity_base' => $baseQuantity,
            'base_unit' => $baseUnitCode,
            'quantity_display' => $displayQuantity,
            'display_unit' => $conversion->toUnit->code,
            'display_unit_configured' => true,
            'verified' => $conversion->verified,
            'notes' => $conversion->notes,
        ];
    }

    /**
     * Explicit re-display in an arbitrary configured unit (spec §24 — the
     * user can switch, e.g. cement between "sac" and "tonne", without
     * re-running any calculation). Returns null if that specific target
     * unit isn't configured for this material/country — never a guess.
     */
    public function convertTo(Material $material, float $baseQuantity, string $baseUnitCode, string $targetUnitCode, string $countryCode, ?string $city = null): ?float
    {
        if ($targetUnitCode === $baseUnitCode) {
            return $baseQuantity;
        }

        $conversion = $this->findConversion($material, $baseUnitCode, $countryCode, $city, $targetUnitCode);

        if (! $conversion) {
            return null;
        }

        return ceil(($baseQuantity / $conversion->factor) * 100) / 100;
    }

    /**
     * All configured alternate display units for a material in a given
     * country (spec §12/§13 — centralized here, never duplicated in a
     * React component or a Blade template). Never invents an entry: a
     * material with no configured conversion simply returns an empty list.
     *
     * @return array<int, array{unit: string, label: string, quantity: float, verified: bool}>
     */
    public function availableConversions(Material $material, float $baseQuantity, string $countryCode): array
    {
        return UnitConversion::where('material_id', $material->id)
            ->where('country_code', $countryCode)
            ->whereNull('city')
            ->with('toUnit')
            ->get()
            ->map(fn (UnitConversion $conversion) => [
                'unit' => $conversion->toUnit->code,
                'label' => $conversion->toUnit->name,
                'quantity' => ceil(($baseQuantity / $conversion->factor) * 100) / 100,
                'verified' => $conversion->verified,
            ])
            ->values()
            ->all();
    }

    private function findConversion(Material $material, string $baseUnitCode, string $countryCode, ?string $city, ?string $targetUnitCode = null): ?UnitConversion
    {
        $fromUnit = Unit::where('code', $baseUnitCode)->first();

        if (! $fromUnit) {
            return null;
        }

        $query = UnitConversion::where('material_id', $material->id)
            ->where('country_code', $countryCode)
            ->where('from_unit_id', $fromUnit->id);

        if ($targetUnitCode) {
            $targetUnit = Unit::where('code', $targetUnitCode)->first();
            if (! $targetUnit) {
                return null;
            }
            $query->where('to_unit_id', $targetUnit->id);
        }

        if ($city) {
            $cityMatch = (clone $query)->where('city', $city)->first();

            if ($cityMatch) {
                return $cityMatch;
            }
        }

        return $query->whereNull('city')->where('is_default', true)->first();
    }
}
