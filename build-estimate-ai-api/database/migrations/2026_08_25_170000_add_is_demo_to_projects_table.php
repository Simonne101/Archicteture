<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Flags the 4 public showcase projects (Database\Seeders\
            // DemoProjectSeeder) — reuses the real projects/plans/analyses/
            // estimates/reports tables instead of a parallel "demo" schema,
            // and is what the public (unauthenticated) demo endpoints filter
            // on so they can never leak a real user's data.
            $table->boolean('is_demo')->default(false)->after('status');
            $table->string('demo_slug')->nullable()->unique()->after('is_demo');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['is_demo', 'demo_slug']);
        });
    }
};
