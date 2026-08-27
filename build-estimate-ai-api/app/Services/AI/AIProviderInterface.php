<?php

namespace App\Services\AI;

use App\DTOs\AIAnalysisResult;
use App\Models\Plan;

interface AIProviderInterface
{
    /**
     * Analyze the given plan and return a normalized result. Implementations
     * throw \App\Exceptions\PlanAnalysisException on failure — they must
     * never fabricate data when the plan cannot actually be analyzed
     * (spec §84: an unknown value must stay unknown).
     */
    public function analyzePlan(Plan $plan): AIAnalysisResult;

    /**
     * Machine-readable provider name, stored on plan_analyses.provider for
     * reproducibility (spec §28).
     */
    public function name(): string;
}
