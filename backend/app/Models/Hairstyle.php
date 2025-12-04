<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hairstyle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image_url',
        'description',
        'default_service_id',
    ];

    /**
     * Relasi yang dipakai AdminCatalogController:
     * Hairstyle::with('defaultService')->get()
     *
     * Di JSON akan muncul sebagai field "default_service"
     * sehingga cocok dengan frontend yang pakai h.default_service?.name
     */
    public function defaultService()
    {
        return $this->belongsTo(Service::class, 'default_service_id');
    }

    /**
     * Alias opsional kalau ada kode lain yang memanggil $hairstyle->service
     * (misalnya sisa kode lama).
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'default_service_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
