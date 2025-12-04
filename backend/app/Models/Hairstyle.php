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
     * Relationship used by AdminCatalogController:
     * Hairstyle::with('defaultService')->get()
     *
     * In JSON it appears as "default_service",
     * matching frontend usage h.default_service?.name.
     */
    public function defaultService()
    {
        return $this->belongsTo(Service::class, 'default_service_id');
    }

    /**
     * Optional alias for legacy code that calls $hairstyle->service.
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
