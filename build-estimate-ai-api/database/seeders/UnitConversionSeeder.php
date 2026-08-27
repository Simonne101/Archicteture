<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Unit;
use App\Models\UnitConversion;
use Illuminate\Database\Seeder;

/**
 * Deliberately sparse. Only seeds a conversion where the factor is a real,
 * defensible fact — never a guessed local custom (spec Règle 9/13).
 *
 * Cement bags are packaged in a standard, verifiable weight (50 kg is the
 * common standard in West/Central Africa) — that's a packaging fact, not an
 * estimate, so it's seeded as `verified: true`.
 *
 * Sand/gravel sold by the "roue" (wheelbarrow load) has NO standard
 * capacity — it genuinely varies by supplier and is never seeded here. A
 * project in Bénin/Cameroun will correctly show sand/gravel in m³ with
 * `display_unit_configured: false` until someone measures and configures
 * the real local wheelbarrow capacity (spec: never invent it).
 */
class UnitConversionSeeder extends Seeder
{
    public function run(): void
    {
        $ciment = Material::where('code', 'ciment')->first();
        $tonne = Unit::where('code', 'tonne')->first();
        $sac = Unit::where('code', 'sac')->first();

        if (! $ciment || ! $tonne || ! $sac) {
            $this->command?->warn('UnitConversionSeeder skipped: run UnitSeeder and MaterialSeeder first.');

            return;
        }

        foreach (['BJ', 'CM'] as $countryCode) {
            UnitConversion::updateOrCreate(
                [
                    'material_id' => $ciment->id,
                    'country_code' => $countryCode,
                    'city' => null,
                    'to_unit_id' => $sac->id,
                ],
                [
                    'from_unit_id' => $tonne->id,
                    'factor' => 0.05, // 1 sac = 50 kg = 0.05 tonne
                    'verified' => true,
                    'notes' => 'Sac standard de 50 kg — poids de conditionnement, pas une estimation.',
                    'is_default' => true,
                ]
            );
        }
    }
}
