<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Enums\UsageMetric;
use App\Exceptions\InsufficientUsageException;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\UsageRecord;
use App\Models\User;

/**
 * Enforces subscription-plan limits (spec §43-45) and tracks monthly usage
 * per organization. Every limit is read from the organization's current
 * SubscriptionPlan — never hardcoded here — so changing a plan's caps never
 * requires a code change.
 */
class UsageService
{
    public function currentPeriod(): string
    {
        return now()->format('Y-m');
    }

    /**
     * The plan governing this organization right now: its active
     * subscription's plan, or the "free" plan if it has none. If no "free"
     * plan is seeded (e.g. an environment that hasn't run
     * SubscriptionPlanSeeder), usage limits fail open rather than blocking
     * every metered action on a missing config row.
     */
    public function planFor(Organization $organization): SubscriptionPlan
    {
        $subscription = $organization->currentSubscription();

        if ($subscription && $subscription->isActive()) {
            return $subscription->plan;
        }

        return SubscriptionPlan::where('slug', 'free')->first() ?? new SubscriptionPlan([
            'name' => 'Illimité (aucun forfait configuré)',
            'slug' => 'unconfigured',
            'limits' => [],
        ]);
    }

    public function currentUsage(Organization $organization, UsageMetric $metric): int
    {
        return (int) UsageRecord::query()
            ->where('organization_id', $organization->id)
            ->where('metric', $metric)
            ->where('period', $this->currentPeriod())
            ->value('count');
    }

    /**
     * Throws InsufficientUsageException if consuming $amount more of $metric
     * would exceed the organization's plan limit. A null limit means
     * unlimited. Call before performing the action being metered.
     *
     * $actor is the user performing the action, not the organization — a
     * demo or admin account bypasses every plan limit entirely (never
     * blocked, never shown a "quota reached" message), regardless of which
     * organization/plan they're acting through. This is the single choke
     * point all three metered actions (upload/analyze/report) go through,
     * so the bypass lives here once instead of being repeated per-caller.
     */
    public function ensureCanConsume(Organization $organization, UsageMetric $metric, int $amount = 1, ?User $actor = null): void
    {
        if ($actor?->account_type?->bypassesUsageLimits()) {
            return;
        }

        $limit = $this->planFor($organization)->limitFor($metric->limitKey());

        if ($limit === null) {
            return;
        }

        if ($this->currentUsage($organization, $metric) + $amount > $limit) {
            throw new InsufficientUsageException(
                "Limite de votre forfait atteinte pour « {$metric->value} » ({$limit}/mois). Passez à un forfait supérieur pour continuer."
            );
        }
    }

    /**
     * Read-only counterpart to ensureCanConsume() — reports whether an
     * action WOULD be allowed and why, without throwing. This is what
     * "authorization" (can I?) should be, kept separate from "consumption"
     * (recording that it happened) per the demo-account spec.
     *
     * @return array{allowed: bool, unlimited: bool, used?: int, limit?: int, remaining?: int}
     */
    public function accessFor(Organization $organization, UsageMetric $metric, User $actor): array
    {
        if ($actor->account_type?->bypassesUsageLimits()) {
            return ['allowed' => true, 'unlimited' => true];
        }

        $limit = $this->planFor($organization)->limitFor($metric->limitKey());

        if ($limit === null) {
            return ['allowed' => true, 'unlimited' => true];
        }

        $used = $this->currentUsage($organization, $metric);

        return [
            'allowed' => $used < $limit,
            'unlimited' => false,
            'used' => $used,
            'limit' => $limit,
            'remaining' => max(0, $limit - $used),
        ];
    }

    public function increment(Organization $organization, UsageMetric $metric, int $amount = 1): void
    {
        $record = UsageRecord::firstOrCreate(
            [
                'organization_id' => $organization->id,
                'metric' => $metric,
                'period' => $this->currentPeriod(),
            ],
            ['count' => 0]
        );

        $record->increment('count', $amount);
    }

    public function ensureCanAddTeamMember(Organization $organization): void
    {
        $limit = $this->planFor($organization)->limitFor('team_members');

        if ($limit === null) {
            return;
        }

        if ($organization->users()->count() >= $limit) {
            throw new InsufficientUsageException(
                "Limite de votre forfait atteinte pour le nombre de membres d'équipe ({$limit}). Passez à un forfait supérieur pour continuer."
            );
        }
    }

    /**
     * A full picture of the organization's plan, current usage, and limits
     * — what the dashboard and subscription screens both need.
     */
    public function summary(Organization $organization): array
    {
        $plan = $this->planFor($organization);

        $usage = [];
        foreach (UsageMetric::cases() as $metric) {
            $usage[$metric->value] = $this->currentUsage($organization, $metric);
        }
        $usage['team_members'] = $organization->users()->count();

        $subscription = $organization->currentSubscription();

        return [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
            ],
            'subscription_status' => $subscription?->status ?? SubscriptionStatus::Active,
            'period' => $this->currentPeriod(),
            'usage' => $usage,
            'limits' => $plan->limits,
        ];
    }
}
