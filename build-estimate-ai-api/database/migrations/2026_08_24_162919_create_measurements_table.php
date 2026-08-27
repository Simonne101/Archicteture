<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measurements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('plan_analysis_id');
            // room | wall | opening | level | area | structure
            $table->string('category');
            $table->string('label')->nullable();

            // Not every category uses every dimension (a room has a surface
            // but not a length; a wall has length/thickness but not surface)
            // — all nullable rather than forcing zeros for unknown values
            // (spec §84: an unknown value must stay unknown, never 0).
            $table->decimal('length', 10, 3)->nullable();
            $table->decimal('width', 10, 3)->nullable();
            $table->decimal('height', 10, 3)->nullable();
            $table->decimal('surface', 10, 3)->nullable();
            $table->decimal('thickness', 10, 3)->nullable();
            $table->decimal('volume', 10, 3)->nullable();
            // mm | cm | m | m2 | m3 — explicit, never mixed silently (spec §18)
            $table->string('unit');

            $table->string('source')->default('ai'); // ai | user
            $table->decimal('confidence', 4, 3)->nullable(); // null once source=user

            $table->timestamps();

            $table->foreign('plan_analysis_id')->references('id')->on('plan_analyses')->cascadeOnDelete();
            $table->index(['plan_analysis_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measurements');
    }
};
