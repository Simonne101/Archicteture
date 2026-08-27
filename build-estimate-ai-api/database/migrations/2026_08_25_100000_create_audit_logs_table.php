<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('organization_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // e.g. "project.created", "plan.uploaded", "analysis.confirmed",
            // "estimate.generated", "report.downloaded" (spec §42).
            $table->string('action');

            // Polymorphic reference to the record the action was performed
            // on — kept as plain strings (not morphs()) since our models use
            // ULIDs, not auto-increment IDs.
            $table->string('auditable_type')->nullable();
            $table->string('auditable_id')->nullable();

            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();
            $table->index(['organization_id', 'created_at']);
            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
