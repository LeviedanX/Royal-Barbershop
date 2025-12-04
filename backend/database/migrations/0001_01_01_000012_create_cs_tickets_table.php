<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cs_tickets', function (Blueprint $table) {
            $table->id();

            // customer pembuat tiket
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // admin yang menangani (boleh null kalau belum ada yang ambil)
            $table->foreignId('admin_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('subject');
            $table->enum('status', ['open', 'answered', 'closed'])
                ->default('open');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cs_tickets');
    }
};
