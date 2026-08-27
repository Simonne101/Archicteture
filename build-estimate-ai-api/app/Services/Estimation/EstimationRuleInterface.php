<?php

namespace App\Services\Estimation;

use App\Models\Measurement;
use Illuminate\Support\Collection;

interface EstimationRuleInterface
{
    /**
     * Material codes this rule can produce quantities for (spec §21) — used
     * to validate that every code a rule emits actually exists in the
     * materials catalog before an estimate is built from it.
     */
    public function materialCodes(): array;

    /**
     * @param  Collection<int, Measurement>  $measurements  Confirmed measurements for the analysis.
     * @return array<int, array{material_code: string, quantity: float, unit: string, metadata?: array}>
     */
    public function calculate(Collection $measurements): array;
}
