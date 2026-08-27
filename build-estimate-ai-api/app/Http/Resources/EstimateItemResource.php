<?php

namespace App\Http\Resources;

use App\Models\EstimateItem;
use App\Services\Estimation\UnitConversionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin EstimateItem */
class EstimateItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'material_code' => $this->whenLoaded('material', fn () => $this->material->code),
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            // The physical reference quantity behind `quantity`/`unit`
            // above — always populated, always traceable back to the plan's
            // measurements, independent of any unit the user later switches
            // the display to (spec §15/§16).
            'quantity_base' => $this->quantity_base,
            'base_unit' => $this->base_unit,
            'calculation_method' => $this->calculation_method,
            'assumptions' => $this->assumptions,
            // Never auto-applied (spec §25) — the frontend can offer these
            // as an explicit "switch unit" choice; each one already carries
            // whether it's a confirmed conversion or a common-default
            // awaiting verification (spec §29 "verified"). This is a
            // QUANTITY conversion (e.g. tonnes → sacs) — never a price.
            'available_display_units' => $this->availableDisplayUnits(),
        ];
    }

    private function availableDisplayUnits(): array
    {
        if (! $this->relationLoaded('material') || ! $this->material) {
            return [];
        }

        // Lazy-loaded rather than requiring the caller to eager-load the
        // item's own parent estimate — a single cheap indexed lookup per
        // item, and we're already viewing this exact estimate regardless.
        $countryCode = $this->estimate?->country_code;

        if (! $countryCode || $this->quantity_base === null) {
            return [];
        }

        return app(UnitConversionService::class)->availableConversions(
            $this->material,
            (float) $this->quantity_base,
            $countryCode,
        );
    }
}
