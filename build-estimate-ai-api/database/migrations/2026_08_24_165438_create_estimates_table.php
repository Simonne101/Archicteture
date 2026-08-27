<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estimates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('project_id');
            $table->ulid('plan_id');
            $table->ulid('analysis_id');
            $table->string('status')->default('processing'); // see App\Enums\EstimateStatus
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->string('currency', 3);

            // Reproducibility snapshot (spec §27-28): what produced this
            // number, so it never silently changes if rules/prices/AI change
            // later, and can always be explained after the fact.
            $table->string('calculation_version');
            $table->string('ai_provider')->nullable();
            $table->string('ai_model')->nullable();
            $table->json('input_snapshot')->nullable();

            $table->text('error_message')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
            $table->foreign('plan_id')->references('id')->on('plans')->cascadeOnDelete();
            $table->foreign('analysis_id')->references('id')->on('plan_analyses')->cascadeOnDelete();
            $table->index(['project_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estimates');
    }
};
