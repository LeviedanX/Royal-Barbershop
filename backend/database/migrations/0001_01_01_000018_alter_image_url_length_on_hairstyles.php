<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Naikkan panjang kolom image_url pada tabel hairstyles
     * dari default 255 menjadi 2048 karakter.
     */
    public function up(): void
    {
        Schema::table('hairstyles', function (Blueprint $table) {
            $table->string('image_url', 2048)->change();
        });
    }

    /**
     * Rollback: kembalikan panjang kolom image_url ke 255.
     */
    public function down(): void
    {
        Schema::table('hairstyles', function (Blueprint $table) {
            $table->string('image_url', 255)->change();
        });
    }
};
