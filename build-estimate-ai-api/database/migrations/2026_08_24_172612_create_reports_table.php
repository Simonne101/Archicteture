<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('estimate_id');
            $table->foreignId('generated_by')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('processing'); // see App\Enums\ReportStatus
            // Internal storage path only — never exposed via API, downloads
            // are always mediated by a policy-checked controller (spec §34).
            $table->string('storage_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('estimate_id')->references('id')->on('estimates')->cascadeOnDelete();
            $table->index('estimate_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
