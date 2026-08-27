<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique(); // e.g. "ciment", "fer-8mm"
            $table->string('name');
            $table->string('category'); // e.g. "liant", "granulat", "acier"
            $table->string('unit'); // kg | tonne | m3 | barre | ...
            $table->decimal('density', 10, 3)->nullable();
            $table->decimal('default_price', 12, 2)->nullable();
            $table->string('currency', 3)->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
