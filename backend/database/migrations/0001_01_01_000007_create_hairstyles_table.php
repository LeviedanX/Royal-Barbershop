<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hairstyles', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // nama gaya rambut, misal "French Crop"
            $table->string('image_url');      // URL/relative path gambar (panjang awal 255)
            $table->text('description')->nullable();

            $table->foreignId('default_service_id')
                ->nullable()
                ->constrained('services')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hairstyles');
    }
};
