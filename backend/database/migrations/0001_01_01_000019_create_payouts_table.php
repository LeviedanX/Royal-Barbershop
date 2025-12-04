<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('barber_id')
                ->constrained('barbers')
                ->cascadeOnDelete();

            $table->decimal('amount', 10, 2);

            // channel simulasi: DANA, OVO, BANK_TRANSFER, dsb
            $table->string('channel')->default('manual');

            // data rekening simulasi
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();

            // requested | approved | rejected | paid
            $table->string('status')->default('requested');

            $table->timestamp('requested_at')->nullable();
            $table->timestamp('processed_at')->nullable();

            $table->string('note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};
