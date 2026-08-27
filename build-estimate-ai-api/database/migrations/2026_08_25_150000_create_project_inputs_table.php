<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_inputs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('project_id')->unique();

            // Each section is optional and independently editable — not
            // every project fills every section manually, some values may
            // instead come from AI-detected measurements later (spec §8/§16).
            // Stored as JSON rather than one column per field: the field
            // list is intentionally extensible (spec §7) without a migration
            // per new field, matching the config-driven pattern already used
            // for construction_types/estimation_rules elsewhere in the app.
            $table->json('dimensions')->nullable();          // terrain/bâtiment lengths, widths, surface
            $table->json('structure')->nullable();            // levels, ceiling height, foundation/slab/roof type
            $table->json('foundations')->nullable();          // footing type, depth, width, length
            $table->json('walls')->nullable();                // thickness, height, block/brick type
            $table->json('openings')->nullable();              // door/window counts + dimensions
            $table->json('reinforced_concrete')->nullable();   // columns, beams, slabs, rebar diameter
            $table->json('roofing')->nullable();               // type, surface, pitch, covering
            $table->json('materials')->nullable();             // selected/configured material codes

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_inputs');
    }
};
