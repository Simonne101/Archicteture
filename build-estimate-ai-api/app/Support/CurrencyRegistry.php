<?php

namespace App\Support;

/**
 * The single source of truth for country → currency and currency display
 * rules (spec: never hardcode this mapping in more than one place). Backed
 * by config/countries.php and config/currencies.php.
 */
class CurrencyRegistry
{
    public static function isValidCountry(string $countryCode): bool
    {
        return array_key_exists($countryCode, config('countries'));
    }

    public static function isValidCurrency(string $currencyCode): bool
    {
        return array_key_exists($currencyCode, config('currencies'));
    }

    /**
     * The currency a given country uses — the authority for "which currency
     * does this project use", derived from the country, not chosen freely.
     */
    public static function currencyForCountry(string $countryCode): ?string
    {
        return config("countries.{$countryCode}.currency_code");
    }

    public static function countryName(string $countryCode): ?string
    {
        return config("countries.{$countryCode}.name");
    }

    /**
     * @return array{name: string, symbol: string, decimals: int}|null
     */
    public static function currency(string $currencyCode): ?array
    {
        return config("currencies.{$currencyCode}");
    }

    /**
     * Server-side formatting (PDF report) — mirrors the frontend's
     * formatCurrency() so both surfaces render identically. Never the
     * source of truth for the amount itself, only its display.
     */
    public static function format(float $amount, string $currencyCode): string
    {
        $currency = self::currency($currencyCode) ?? ['symbol' => $currencyCode, 'decimals' => 2];

        $formatted = number_format($amount, $currency['decimals'], ',', ' ');

        return "{$formatted} {$currency['symbol']}";
    }

    /**
     * @return array<string, array{name: string, currency_code: string}>
     */
    public static function countries(): array
    {
        return config('countries');
    }

    /**
     * @return array<string, array{name: string, symbol: string, decimals: int}>
     */
    public static function currencies(): array
    {
        return config('currencies');
    }
}
