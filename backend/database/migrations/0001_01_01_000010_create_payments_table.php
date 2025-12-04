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

            // Unique ORDER ID in Midtrans (BOOK-{booking_id}-{timestamp})
            $table->string('midtrans_order_id')->unique();

            // Payment type, e.g., credit_card, gopay, qris, etc.
            $table->string('payment_type')->nullable();

            // Total amount paid
            $table->decimal('gross_amount', 10, 2);

            // Transaction status from Midtrans: pending, capture, settlement, cancel, deny, expire, etc.
            $table->string('transaction_status')->default('pending');

            // Transaction time from Midtrans
            $table->dateTime('transaction_time')->nullable();

            // Fraud status (optional, from Midtrans: accept / deny / challenge)
            $table->string('fraud_status')->nullable();

            // Snap token sent to the frontend
            $table->string('snap_token')->nullable();

            // Store raw JSON callback/response from Midtrans
            $table->json('raw_response')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
