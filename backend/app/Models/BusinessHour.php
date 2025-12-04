<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
        'is_override',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
        'is_override' => 'boolean',
    ];
}
