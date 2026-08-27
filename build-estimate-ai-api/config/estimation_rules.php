<?php

/*
|--------------------------------------------------------------------------
| Estimation rule coefficients
|--------------------------------------------------------------------------
|
| ⚠️  IMPORTANT — these are placeholder defaults, NOT values certified by a
| construction professional or building code. Every estimate generated
| from them is marked `certified: false` with an explicit warning in the
| API response (spec §22). A BTP professional must review/adjust these
| ratios before any estimate is used for real construction decisions.
|
| Kept here — never hardcoded inside a Rule class — so they can be tuned
| without touching code, and so calculation_version can be bumped whenever
| they change (spec §21).
|
*/

return [

    'concrete' => [
        'cement_kg_per_m3' => 350.0,
        'sand_m3_per_m3' => 0.5,
        'gravel_m3_per_m3' => 0.8,
    ],

    'rebar' => [
        'kg_per_m2_wall_surface' => 15.0,
        // Must sum to 1.0 — how the total rebar weight is split across bar
        // diameters.
        'diameter_distribution_mm' => [
            8 => 0.20,
            10 => 0.30,
            12 => 0.20,
            16 => 0.20,
            20 => 0.10,
        ],
        'standard_bar_length_m' => 12.0,
        // Real physical constant (steel density), not a construction rule.
        'steel_density_kg_per_m3' => 7850.0,
    ],

];
