<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BusinessHour;
use Illuminate\Http\Request;

class AdminBusinessHourController extends Controller
{
    protected function ensureAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $hours = BusinessHour::orderBy('day_of_week')->get();

        return response()->json($hours);
    }

    public function update(Request $request, BusinessHour $businessHour)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'open_time'  => 'sometimes|nullable|date_format:H:i',
            'close_time' => 'sometimes|nullable|date_format:H:i',
            'is_closed'  => 'sometimes|boolean',
            'is_override'=> 'sometimes|boolean',
        ]);

        $businessHour->update($data);

        return response()->json($businessHour);
    }

    /**
     * Tutup toko sementara: set semua is_closed = true.
     */
    public function closeShop(Request $request)
    {
        $this->ensureAdmin($request);

        BusinessHour::query()->update([
            'is_closed' => true,
        ]);

        return response()->json(['message' => 'Toko ditutup sementara (semua hari closed)']);
    }

    /**
     * Buka toko dengan jam default: 07:00 - 21:00, semua hari.
     */
    public function openShopDefault(Request $request)
    {
        $this->ensureAdmin($request);

        BusinessHour::query()->update([
            'open_time'  => '07:00:00',
            'close_time' => '21:00:00',
            'is_closed'  => false,
        ]);

        return response()->json(['message' => 'Toko dibuka dengan jam default 07:00-21:00']);
    }
}
