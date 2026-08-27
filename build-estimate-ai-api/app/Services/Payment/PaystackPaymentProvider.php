<?php

namespace App\Services\Payment;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use RuntimeException;

/**
 * Extension point for a real Paystack integration — see StripePaymentProvider
 * for the same note. Not wired to a live account in this build.
 */
class PaystackPaymentProvider implements PaymentProviderInterface
{
    public function createCheckoutSession(Subscription $subscription, SubscriptionPlan $plan, string $successUrl, string $cancelUrl): string
    {
        throw new RuntimeException(
            'Le fournisseur de paiement Paystack n\'est pas configuré. Définissez PAYSTACK_SECRET_KEY et implémentez '.self::class.'.'
        );
    }

    public function cancelSubscription(Subscription $subscription): void
    {
        throw new RuntimeException(
            'Le fournisseur de paiement Paystack n\'est pas configuré. Définissez PAYSTACK_SECRET_KEY et implémentez '.self::class.'.'
        );
    }

    public function name(): string
    {
        return 'paystack';
    }
}
