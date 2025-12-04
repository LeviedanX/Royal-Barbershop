<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use Illuminate\Http\Request;

class BarberController extends Controller
{
    /**
     * GET /api/barbers
     * List semua barber dengan ranking (score) dan rating.
     */
    public function index()
    {
        // Ambil semua barber + user
        $barbers = Barber::with('user')->get()
            // sortByDesc pakai accessor score
            ->sortByDesc(fn ($b) => $b->score)
            ->values(); // reset index

        return response()->json($barbers);
    }

    /**
     * GET /api/barbers/{barber}
     * Detail satu barber.
     */
    public function show(Barber $barber)
    {
        $barber->load('user', 'reviews');

        return response()->json($barber);
    }
}
