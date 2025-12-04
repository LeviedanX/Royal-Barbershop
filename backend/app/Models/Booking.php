<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'barber_id',
        'service_id',
        'hairstyle_id',
        'queue_number',
        'booking_date',
        'scheduled_at',
        'status',
        'total_price',
        'coupon_id',
        'payment_status',
        'finished_at',
    ];

    protected $casts = [
        'booking_date'  => 'date',
        'scheduled_at'  => 'datetime',
        'finished_at'   => 'datetime',
        'total_price'   => 'decimal:2',
    ];

    // ===== Relasi =====

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function hairstyle()
    {
        return $this->belongsTo(Hairstyle::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    /**
     * Semua payment (riwayat transaksi) untuk booking ini.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Satu payment utama/terbaru (dipakai di dashboard).
     * Dengan ini, kalau di controller kamu pakai with('payment'),
     * maka JSON akan punya field "payment" (bukan array).
     */
    public function payment()
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }
}
