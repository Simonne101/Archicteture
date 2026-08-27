<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            // Physical units — what the calculation engine works in.
            ['code' => 'kg', 'name' => 'Kilogramme', 'symbol' => 'kg', 'type' => 'physical'],
            ['code' => 'tonne', 'name' => 'Tonne', 'symbol' => 't', 'type' => 'physical'],
            ['code' => 'm3', 'name' => 'Mètre cube', 'symbol' => 'm³', 'type' => 'physical'],
            ['code' => 'm2', 'name' => 'Mètre carré', 'symbol' => 'm²', 'type' => 'physical'],
            ['code' => 'm', 'name' => 'Mètre linéaire', 'symbol' => 'ml', 'type' => 'physical'],
            ['code' => 'litre', 'name' => 'Litre', 'symbol' => 'L', 'type' => 'physical'],
            ['code' => 'unite', 'name' => 'Unité', 'symbol' => 'u', 'type' => 'physical'],

            // Commercial/local units — how materials are actually bought.
            ['code' => 'sac', 'name' => 'Sac', 'symbol' => 'sac', 'type' => 'commercial'],
            ['code' => 'roue', 'name' => 'Roue (brouette)', 'symbol' => 'roue', 'type' => 'commercial'],
            ['code' => 'barre', 'name' => 'Barre', 'symbol' => 'barre', 'type' => 'commercial'],
            ['code' => 'camion', 'name' => 'Camion', 'symbol' => 'camion', 'type' => 'commercial'],
            ['code' => 'seau', 'name' => 'Seau', 'symbol' => 'seau', 'type' => 'commercial'],
            ['code' => 'palette', 'name' => 'Palette', 'symbol' => 'palette', 'type' => 'commercial'],
            ['code' => 'carton', 'name' => 'Carton', 'symbol' => 'carton', 'type' => 'commercial'],
            ['code' => 'feuille', 'name' => 'Feuille', 'symbol' => 'feuille', 'type' => 'commercial'],
            ['code' => 'piece', 'name' => 'Pièce', 'symbol' => 'pièce', 'type' => 'commercial'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(['code' => $unit['code']], $unit + ['active' => true]);
        }
    }
}
