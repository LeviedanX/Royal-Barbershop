<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('display_name');
            $table->text('bio')->nullable();
            $table->enum('skill_level', ['junior', 'senior', 'master'])->default('junior');
            $table->decimal('base_price', 10, 2)->default(0);
            $table->float('avg_rating')->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->unsignedInteger('total_completed_orders')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barbers');
    }
};
