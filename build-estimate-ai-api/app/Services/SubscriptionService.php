<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\Payment\PaymentProviderInterface;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    public function __construct(private readonly PaymentProviderInterface $payments) {}

    /**
     * Starts (or switches to) a subscription for the given plan. The
     * organization's previous subscription, if any, is canceled immediately
     * — an organization has at most one governing subscription at a time.
     * Returns the checkout URL the client should redirect to; for the mock
     * provider, the subscription is already active by the time this returns.
     */
    public function subscribe(Organization $organization, SubscriptionPlan $plan, string $billingInterval, string $successUrl, string $cancelUrl): array
    {
        $subscription = DB::transaction(function () use ($organization, $plan, $billingInterval) {
            $previous = $organization->currentSubscription();
            if ($previous && $previous->isActive()) {
                $previous->update(['status' => SubscriptionStatus::Canceled, 'canceled_at' => now()]);
            }

            return Subscription::create([
                'organization_id' => $organization->id,
                'subscription_plan_id' => $plan->id,
                'status' => SubscriptionStatus::Trialing,
                'billing_interval' => $billingInterval,
            ]);
        });

        $checkoutUrl = $this->payments->createCheckoutSession($subscription, $plan, $successUrl, $cancelUrl);

        return [$subscription->fresh(), $checkoutUrl];
    }

    public function cancel(Subscription $subscription): Subscription
    {
        $this->payments->cancelSubscription($subscription);

        return $subscription->fresh();
    }
}
