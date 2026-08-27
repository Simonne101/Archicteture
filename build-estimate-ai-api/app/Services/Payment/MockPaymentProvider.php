<?php

namespace App\Services\Payment;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Str;

/**
 * Default provider — requires no API key, so subscription flows are fully
 * testable in CI without a live Stripe/Paystack/Flutterwave account. A real
 * provider would redirect to a hosted checkout page and confirm payment
 * asynchronously via webhook; this one confirms synchronously and inline,
 * standing in for that webhook.
 */
class MockPaymentProvider implements PaymentProviderInterface
{
    public function createCheckoutSession(Subscription $subscription, SubscriptionPlan $plan, string $successUrl, string $cancelUrl): string
    {
        $periodStart = now();
        $periodEnd = $subscription->billing_interval === 'yearly'
            ? $periodStart->copy()->addYear()
            : $periodStart->copy()->addMonth();

        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'current_period_start' => $periodStart,
            'current_period_end' => $periodEnd,
            'payment_provider' => $this->name(),
            'payment_provider_subscription_id' => 'mock_'.Str::uuid()->toString(),
        ]);

        return $successUrl;
    }

    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'cancel_at_period_end' => true,
            'canceled_at' => now(),
        ]);
    }

    public function name(): string
    {
        return 'mock';
    }
}
