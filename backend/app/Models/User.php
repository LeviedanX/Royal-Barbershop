<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'loyalty_count',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // ===== Relasi =====

    public function bookings()
    {
        // booking sebagai customer
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    public function barberProfile()
    {
        return $this->hasOne(Barber::class);
    }

    public function csTickets()
    {
        return $this->hasMany(CsTicket::class);
    }

    public function csMessages()
    {
        return $this->hasMany(CsMessage::class, 'sender_id');
    }
}
