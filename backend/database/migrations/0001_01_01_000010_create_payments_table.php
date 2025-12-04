<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            // ORDER ID unik di Midtrans (BOOK-{booking_id}-{timestamp})
            $table->string('midtrans_order_id')->unique();

            // Jenis pembayaran, misal: credit_card, gopay, qris, dll
            $table->string('payment_type')->nullable();

            // Total yang dibayar
            $table->decimal('gross_amount', 10, 2);

            // Status transaksi dari Midtrans: pending, capture, settlement, cancel, deny, expire, dll
            $table->string('transaction_status')->default('pending');

            // Waktu transaksi di Midtrans
            $table->dateTime('transaction_time')->nullable();

            // Status fraud (optional, dari Midtrans: accept / deny / challenge)
            $table->string('fraud_status')->nullable();

            // Snap token yang dikirim ke frontend
            $table->string('snap_token')->nullable();

            // Simpan raw JSON callback / response Midtrans
            $table->json('raw_response')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
