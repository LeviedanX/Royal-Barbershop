<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'discount_percent',
        'is_used',
        'used_at',
        'expires_at',
        'issued_reason',
    ];

    protected $casts = [
        'is_used'   => 'boolean',
        'used_at'   => 'datetime',
        'expires_at'=> 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
