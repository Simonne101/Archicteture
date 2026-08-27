<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estimate_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('estimate_id');
            $table->ulid('material_id');
            $table->string('description');
            $table->decimal('quantity', 14, 3);
            $table->string('unit');

            // Snapshotted at generation time (spec §27) — never recomputed
            // from the live material_prices table, so a past estimate's
            // total stays reproducible even if prices change tomorrow.
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 14, 2);
            $table->string('currency', 3);

            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('estimate_id')->references('id')->on('estimates')->cascadeOnDelete();
            $table->foreign('material_id')->references('id')->on('materials')->restrictOnDelete();
            $table->index('estimate_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estimate_items');
    }
};
