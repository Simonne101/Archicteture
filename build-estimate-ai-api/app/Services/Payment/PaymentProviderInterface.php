<?php

namespace App\Services\Payment;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;

/**
 * Abstracts subscription billing behind a provider-agnostic contract, the
 * same way App\Services\AI\AIProviderInterface abstracts AI vendors. No
 * concrete provider (Stripe/Paystack/Flutterwave) ships wired to a live
 * account in this build — this is the extension point, not a finished
 * integration.
 */
interface PaymentProviderInterface
{
    /**
     * Starts a checkout for the given plan and returns the URL the client
     * should redirect the user to in order to complete payment.
     */
    public function createCheckoutSession(Subscription $subscription, SubscriptionPlan $plan, string $successUrl, string $cancelUrl): string;

    public function cancelSubscription(Subscription $subscription): void;

    public function name(): string;
}
