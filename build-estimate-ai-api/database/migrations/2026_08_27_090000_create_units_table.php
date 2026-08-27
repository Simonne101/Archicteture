<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique(); // 'kg', 'tonne', 'm3', 'sac', 'roue', 'barre'...
            $table->string('name');
            $table->string('symbol');
            // 'physical' (kg, m³, m²...) vs 'commercial' (sac, roue, barre,
            // camion...) — the distinction the whole conversion layer exists
            // to bridge (spec §5).
            $table->string('type');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
