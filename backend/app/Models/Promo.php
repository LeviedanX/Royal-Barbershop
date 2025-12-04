<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'day_of_week',
        'discount_percent',
        'service_id',
        'is_active',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'discount_percent' => 'integer',
        'day_of_week'      => 'integer',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
