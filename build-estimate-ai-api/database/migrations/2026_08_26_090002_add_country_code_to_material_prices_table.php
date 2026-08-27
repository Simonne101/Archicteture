<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('material_prices', function (Blueprint $table) {
            // Replaces the old free-text "region" ('default') as the real
            // lookup key — Material::currentPrice() now resolves by country,
            // falling back to any price sharing that country's currency
            // (spec: real per-market pricing, never a relabeled default).
            $table->string('country_code', 2)->nullable()->after('region');
            $table->index(['material_id', 'country_code']);
        });
    }

    public function down(): void
    {
        Schema::table('material_prices', function (Blueprint $table) {
            $table->dropIndex(['material_id', 'country_code']);
            $table->dropColumn('country_code');
        });
    }
};
