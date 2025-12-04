<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('barber_id')
                ->constrained('barbers')
                ->cascadeOnDelete();

            $table->tinyInteger('rating_barber'); // 1-5
            $table->tinyInteger('rating_shop');   // 1-5
            $table->text('comment')->nullable();

            $table->timestamps();

            $table->unique('booking_id'); // satu booking satu review
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
