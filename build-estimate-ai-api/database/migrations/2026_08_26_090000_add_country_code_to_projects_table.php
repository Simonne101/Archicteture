<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Drives `currency` (App\Support\CurrencyRegistry) — nullable
            // for existing rows created before this column existed.
            $table->string('country_code', 2)->nullable()->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('country_code');
        });
    }
};
