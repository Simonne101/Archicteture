<?php

use App\Services\Payment\FlutterwavePaymentProvider;
use App\Services\Payment\MockPaymentProvider;
use App\Services\Payment\PaystackPaymentProvider;
use App\Services\Payment\StripePaymentProvider;

return [

    /*
    |--------------------------------------------------------------------------
    | Active payment provider
    |--------------------------------------------------------------------------
    |
    | "mock" requires no API key and is what tests/seeders/CI use. Real
    | providers plug in here without any other part of the app changing,
    | since everything depends only on
    | App\Services\Payment\PaymentProviderInterface.
    |
    */

    'provider' => env('PAYMENT_PROVIDER', 'mock'),

    'providers' => [
        'mock' => MockPaymentProvider::class,
        'stripe' => StripePaymentProvider::class,
        'paystack' => PaystackPaymentProvider::class,
        'flutterwave' => FlutterwavePaymentProvider::class,
    ],

];
