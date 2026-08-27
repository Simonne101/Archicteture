<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estimates', function (Blueprint $table) {
            // Snapshotted at generation time, same reproducibility principle
            // as calculation_version/ai_provider — if the project's country
            // changes later, this historical estimate must not (spec §5/§19).
            $table->string('country_code', 2)->nullable()->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('estimates', function (Blueprint $table) {
            $table->dropColumn('country_code');
        });
    }
};
