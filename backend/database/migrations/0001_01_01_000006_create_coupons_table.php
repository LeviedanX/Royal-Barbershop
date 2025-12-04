<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('code')->unique();
            $table->unsignedTinyInteger('discount_percent'); // contoh: 25
            $table->boolean('is_used')->default(false);
            $table->dateTime('used_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->string('issued_reason')->nullable(); // misal: LOYALTY_7_ORDERS

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
