<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Currency display rules
    |--------------------------------------------------------------------------
    |
    | Controls formatting only (symbol, decimal places) — never the amount
    | itself. XOF/XAF both display as "FCFA" with 0 decimals (neither BCEAO
    | nor BEAC subdivide their franc in practice); EUR/USD use 2 decimals.
    |
    */

    'XOF' => ['name' => 'Franc CFA (BCEAO)', 'symbol' => 'FCFA', 'decimals' => 0],
    'XAF' => ['name' => 'Franc CFA (BEAC)', 'symbol' => 'FCFA', 'decimals' => 0],
    'EUR' => ['name' => 'Euro', 'symbol' => '€', 'decimals' => 2],
    'USD' => ['name' => 'Dollar américain', 'symbol' => '$', 'decimals' => 2],

];
