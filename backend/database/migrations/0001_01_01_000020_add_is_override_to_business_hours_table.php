<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_hours', function (Blueprint $table) {
            // sesuaikan "is_closed" dengan kolom yang sudah pasti ada di tabelmu
            $table->boolean('is_override')
                ->default(false)
                ->after('is_closed');
        });
    }

    public function down(): void
    {
        Schema::table('business_hours', function (Blueprint $table) {
            $table->dropColumn('is_override');
        });
    }
};
