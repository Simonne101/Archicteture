<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_conversions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('material_id');
            $table->string('country_code', 2);
            // A commercial unit's real-world capacity can vary even within
            // one country (spec §14) — nullable: null = the country-wide
            // default, a value = an override specific to that city.
            $table->string('city')->nullable();
            $table->ulid('from_unit_id'); // physical unit the engine calculates in
            $table->ulid('to_unit_id');   // commercial unit to present
            $table->decimal('factor', 14, 6); // 1 to_unit = `factor` from_unit
            // A conversion the team has actually confirmed (e.g. a bag is
            // definitionally 50kg) vs. a commonly-cited default awaiting
            // confirmation (e.g. a wheelbarrow's capacity) — surfaced to the
            // user, never silently presented as equally certain (spec §29).
            $table->boolean('verified')->default(false);
            $table->text('notes')->nullable();
            $table->boolean('is_default')->default(true);
            $table->timestamps();

            $table->foreign('material_id')->references('id')->on('materials')->cascadeOnDelete();
            $table->foreign('from_unit_id')->references('id')->on('units')->restrictOnDelete();
            $table->foreign('to_unit_id')->references('id')->on('units')->restrictOnDelete();
            $table->unique(['material_id', 'country_code', 'city', 'to_unit_id'], 'unit_conversions_unique_target');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_conversions');
    }
};
