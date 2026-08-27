<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * BUILD ESTIMATE AI stops computing/storing financial figures on new
 * estimates (business rule: the engine estimates material quantities, never
 * cost) — these columns are relaxed rather than dropped, so historical rows
 * generated before this change keep their price data intact and no
 * destructive migration is needed (spec: "ne détruis pas les données
 * existantes").
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estimate_items', function (Blueprint $table) {
            $table->decimal('unit_price', 12, 2)->nullable()->change();
            $table->decimal('total_price', 14, 2)->nullable()->change();
            $table->string('currency', 3)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('estimate_items', function (Blueprint $table) {
            $table->decimal('unit_price', 12, 2)->nullable(false)->change();
            $table->decimal('total_price', 14, 2)->nullable(false)->change();
            $table->string('currency', 3)->nullable(false)->change();
        });
    }
};
