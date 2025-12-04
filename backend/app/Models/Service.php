<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'base_price',
        'duration_minutes',
        'is_bundle',
    ];

    protected $casts = [
        'base_price'       => 'decimal:2',
        'duration_minutes' => 'integer',
        'is_bundle'        => 'boolean',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function hairstyles()
    {
        return $this->hasMany(Hairstyle::class, 'default_service_id');
    }
}
