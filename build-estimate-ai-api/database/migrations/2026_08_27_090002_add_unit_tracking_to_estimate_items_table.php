<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estimate_items', function (Blueprint $table) {
            // The existing quantity/unit columns are untouched and keep
            // holding whatever is shown by default — these new columns make
            // the physical↔commercial distinction explicit and traceable
            // (spec §15/§16) without breaking anything that already reads
            // quantity/unit today.
            $table->decimal('quantity_base', 14, 3)->nullable()->after('unit');
            $table->string('base_unit')->nullable()->after('quantity_base');
            $table->string('display_unit')->nullable()->after('base_unit');
            $table->boolean('display_unit_configured')->default(false)->after('display_unit');
            $table->string('calculation_method')->nullable()->after('display_unit_configured');
            $table->json('assumptions')->nullable()->after('calculation_method');
            $table->decimal('confidence', 4, 3)->nullable()->after('assumptions');
        });
    }

    public function down(): void
    {
        Schema::table('estimate_items', function (Blueprint $table) {
            $table->dropColumn([
                'quantity_base', 'base_unit', 'display_unit',
                'display_unit_configured', 'calculation_method', 'assumptions', 'confidence',
            ]);
        });
    }
};
