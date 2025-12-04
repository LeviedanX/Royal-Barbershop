<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('barber_id')
                ->constrained('barbers')
                ->cascadeOnDelete();

            $table->foreignId('service_id')
                ->constrained('services')
                ->cascadeOnDelete();

            $table->foreignId('hairstyle_id')
                ->nullable()
                ->constrained('hairstyles')
                ->nullOnDelete();

            $table->unsignedInteger('queue_number');
            $table->date('booking_date'); // buat reset nomor antrian harian
            $table->dateTime('scheduled_at');

            $table->enum('status', ['waiting', 'in_progress', 'done', 'cancelled'])
                ->default('waiting');

            $table->decimal('total_price', 10, 2);

            $table->foreignId('coupon_id')
                ->nullable()
                ->constrained('coupons')
                ->nullOnDelete();

            $table->enum('payment_status', ['unpaid', 'pending', 'paid', 'failed'])
                ->default('unpaid');

            $table->dateTime('finished_at')->nullable();

            $table->timestamps();

            // Optional index untuk performa
            $table->index(['booking_date', 'queue_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
