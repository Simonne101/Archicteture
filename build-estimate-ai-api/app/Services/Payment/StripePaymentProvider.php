<?php

namespace App\Services\Payment;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use RuntimeException;

/**
 * Extension point for a real Stripe integration — deliberately not wired to
 * a live account in this build. Wiring it up means adding the Stripe SDK,
 * implementing these methods against it, and adding a webhook route to
 * confirm payment asynchronously (mirrored by MockPaymentProvider's
 * synchronous stand-in).
 */
class StripePaymentProvider implements PaymentProviderInterface
{
    public function createCheckoutSession(Subscription $subscription, SubscriptionPlan $plan, string $successUrl, string $cancelUrl): string
    {
        throw new RuntimeException(
            'Le fournisseur de paiement Stripe n\'est pas configuré. Définissez STRIPE_SECRET_KEY et implémentez '.self::class.'.'
        );
    }

    public function cancelSubscription(Subscription $subscription): void
    {
        throw new RuntimeException(
            'Le fournisseur de paiement Stripe n\'est pas configuré. Définissez STRIPE_SECRET_KEY et implémentez '.self::class.'.'
        );
    }

    public function name(): string
    {
        return 'stripe';
    }
}
