<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CsTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'admin_id',
        'subject',
        'status',
    ];

    public function user()
    {
        // customer pembuat tiket
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        // admin yang menangani tiket
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function messages()
    {
        return $this->hasMany(CsMessage::class, 'ticket_id');
    }
}
