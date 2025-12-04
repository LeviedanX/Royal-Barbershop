<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'midtrans_order_id',
        'payment_type',
        'gross_amount',
        'transaction_status',
        'transaction_time',
        'fraud_status',
        'snap_token',
        'raw_response',
    ];

    protected $casts = [
        'gross_amount'      => 'decimal:2',
        'transaction_time'  => 'datetime',
        'raw_response'      => 'array', // karena kolomnya json
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
