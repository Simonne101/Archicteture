<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;

/**
 * Prices below are illustrative dev-seed defaults, not a real supplier price
 * list (spec — prices are meant to evolve over time/country/supplier via
 * material_prices, never hardcoded truth). Each material gets a genuinely
 * distinct price per reference market (BJ/XOF, CM/XAF, FR/EUR) — not one
 * price relabeled with three currency codes — so Material::currentPrice()
 * has real per-currency data to resolve. Every other configured country
 * falls back to its currency zone's reference market (see
 * Material::currentPrice()) until it gets its own distinct entry.
 */
class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $materials = [
            // code => [name, category, unit, [country_code => unit_price]]
            'ciment' => ['Ciment', 'liant', 'sac', ['BJ' => 6500, 'CM' => 7000, 'FR' => 7.50]],
            'sable' => ['Sable', 'granulat', 'm3', ['BJ' => 12000, 'CM' => 13000, 'FR' => 35]],
            'gravillon' => ['Gravillon', 'granulat', 'm3', ['BJ' => 15000, 'CM' => 16500, 'FR' => 42]],
            'fer-8mm' => ['Fer à béton Ø 8 mm', 'acier', 'barre', ['BJ' => 3500, 'CM' => 3800, 'FR' => 9.90]],
            'fer-10mm' => ['Fer à béton Ø 10 mm', 'acier', 'barre', ['BJ' => 5500, 'CM' => 6000, 'FR' => 14.50]],
            'fer-12mm' => ['Fer à béton Ø 12 mm', 'acier', 'barre', ['BJ' => 7800, 'CM' => 8500, 'FR' => 20.90]],
            'fer-16mm' => ['Fer à béton Ø 16 mm', 'acier', 'barre', ['BJ' => 13500, 'CM' => 14800, 'FR' => 36.50]],
            'fer-20mm' => ['Fer à béton Ø 20 mm', 'acier', 'barre', ['BJ' => 21000, 'CM' => 23000, 'FR' => 57.90]],
        ];

        // country_code => currency_code — kept local to the seeder so it
        // never depends on the request-time CurrencyRegistry/config wiring
        // being fully booted in every seeding context.
        $marketCurrency = ['BJ' => 'XOF', 'CM' => 'XAF', 'FR' => 'EUR'];

        foreach ($materials as $code => [$name, $category, $unit, $pricesByCountry]) {
            $referencePrice = $pricesByCountry['BJ'];

            $material = Material::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'category' => $category,
                    'unit' => $unit,
                    'default_price' => $referencePrice,
                    'currency' => $marketCurrency['BJ'],
                    'active' => true,
                ]
            );

            foreach ($pricesByCountry as $countryCode => $unitPrice) {
                $material->prices()->updateOrCreate(
                    ['country_code' => $countryCode, 'valid_from' => now()->startOfDay()],
                    [
                        'region' => $countryCode,
                        'unit_price' => $unitPrice,
                        'currency' => $marketCurrency[$countryCode],
                        'source' => 'seed',
                    ]
                );
            }
        }
    }
}
