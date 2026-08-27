<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a realistic dev fixture: one
     * demo user (unlimited usage, see DemoUserSeeder) owning one demo
     * organization, plus the material catalog the estimation engine needs
     * to run at all. Never real API keys.
     */
    public function run(): void
    {
        $this->call(SubscriptionPlanSeeder::class);
        $this->call(DemoUserSeeder::class);
        $this->call(MaterialSeeder::class);
        $this->call(UnitSeeder::class);
        $this->call(UnitConversionSeeder::class);
        $this->call(DemoProjectSeeder::class);
    }
}
