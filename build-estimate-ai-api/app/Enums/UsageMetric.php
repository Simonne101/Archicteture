<?php

namespace App\Enums;

enum UsageMetric: string
{
    case PlansUploaded = 'plans_uploaded';
    case AnalysesRun = 'analyses_run';
    case ReportsGenerated = 'reports_generated';
    case StorageUsedMb = 'storage_used_mb';

    /**
     * The key used for this metric's cap inside SubscriptionPlan::limits.
     */
    public function limitKey(): string
    {
        return match ($this) {
            self::PlansUploaded => 'plans_per_month',
            self::AnalysesRun => 'analyses_per_month',
            self::ReportsGenerated => 'reports_per_month',
            self::StorageUsedMb => 'storage_mb',
        };
    }
}
