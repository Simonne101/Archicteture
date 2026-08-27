<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_prices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('material_id');
            $table->string('region')->default('default');
            $table->string('supplier')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->string('currency', 3);
            $table->date('valid_from');
            $table->date('valid_until')->nullable();
            $table->string('source')->nullable(); // e.g. "manuel", "fournisseur X"
            $table->timestamps();

            $table->foreign('material_id')->references('id')->on('materials')->cascadeOnDelete();
            $table->index(['material_id', 'region', 'valid_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_prices');
    }
};
