<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_analyses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('plan_id');
            $table->string('status')->default('queued'); // see App\Enums\AnalysisStatus
            $table->string('provider'); // e.g. "mock", "openai" — spec §28 reproducibility
            $table->string('model')->nullable();
            $table->decimal('confidence_score', 4, 3)->nullable(); // 0.000–1.000

            // Reproducibility snapshot (spec §28): what pipeline/version
            // produced this result, so a past analysis's output can always
            // be explained later even if rules/providers change.
            $table->string('calculation_version')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('raw_result')->nullable();
            $table->json('normalized_result')->nullable();

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();

            $table->timestamps();

            $table->foreign('plan_id')->references('id')->on('plans')->cascadeOnDelete();
            $table->index(['plan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_analyses');
    }
};
