<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Country → currency
    |--------------------------------------------------------------------------
    |
    | Determines the currency a project uses (spec: the country picked at
    | project creation drives the currency, not a free-standing choice).
    | Config-driven and extensible on purpose — adding a country is a
    | one-line change here, matching the existing construction_types /
    | estimation_rules convention, not a migration.
    |
    | IMPORTANT: XOF (BCEAO) and XAF (BEAC) are two distinct ISO currencies
    | that both colloquially display as "FCFA" — never collapse them into a
    | single "FCFA" concept internally.
    |
    */

    'BJ' => ['name' => 'Bénin', 'currency_code' => 'XOF'],
    'CI' => ['name' => 'Côte d\'Ivoire', 'currency_code' => 'XOF'],
    'SN' => ['name' => 'Sénégal', 'currency_code' => 'XOF'],
    'TG' => ['name' => 'Togo', 'currency_code' => 'XOF'],
    'BF' => ['name' => 'Burkina Faso', 'currency_code' => 'XOF'],
    'ML' => ['name' => 'Mali', 'currency_code' => 'XOF'],
    'NE' => ['name' => 'Niger', 'currency_code' => 'XOF'],
    'GW' => ['name' => 'Guinée-Bissau', 'currency_code' => 'XOF'],

    'CM' => ['name' => 'Cameroun', 'currency_code' => 'XAF'],
    'GA' => ['name' => 'Gabon', 'currency_code' => 'XAF'],
    'CG' => ['name' => 'Congo', 'currency_code' => 'XAF'],
    'CF' => ['name' => 'République centrafricaine', 'currency_code' => 'XAF'],
    'TD' => ['name' => 'Tchad', 'currency_code' => 'XAF'],
    'GQ' => ['name' => 'Guinée équatoriale', 'currency_code' => 'XAF'],

    'FR' => ['name' => 'France', 'currency_code' => 'EUR'],

];
