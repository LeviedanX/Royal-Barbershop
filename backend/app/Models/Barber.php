<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barber extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_name',
        'bio',
        'skill_level',
        'base_price',
        'avg_rating',
        'total_reviews',
        'total_completed_orders',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_price' => 'decimal:2',
        'avg_rating' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Skor ranking barber (gabungan rating + jumlah order).
     * Misal: 0.7 * avg_rating + 0.3 * order_factor * 5
     */
    public function getScoreAttribute()
    {
        // Normalisasi: misal anggap 100 completed_orders sudah dianggap 1.0
        $orderFactor = min($this->total_completed_orders / 100, 1);

        return 0.7 * ($this->avg_rating ?? 0) + 0.3 * $orderFactor * 5;
    }
}
