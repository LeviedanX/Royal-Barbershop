<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * POST /api/bookings/{booking}/review
     * Customer submits ratings for the barber and shop.
     */
    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($booking->status !== 'done') {
            return response()->json(['message' => 'Booking is not completed yet'], 422);
        }

        if ($booking->review) {
            return response()->json(['message' => 'Booking has already been reviewed'], 422);
        }

        $data = $request->validate([
            'rating_barber' => 'required|integer|min:1|max:5',
            'rating_shop'   => 'required|integer|min:1|max:5',
            'comment'       => 'nullable|string',
        ]);

        $review = Review::create([
            'booking_id'    => $booking->id,
            'customer_id'   => $user->id,
            'barber_id'     => $booking->barber_id,
            'rating_barber' => $data['rating_barber'],
            'rating_shop'   => $data['rating_shop'],
            'comment'       => $data['comment'] ?? null,
        ]);

        // Update barber statistics
        $barber = Barber::findOrFail($booking->barber_id);
        $barber->total_reviews = Review::where('barber_id', $barber->id)->count();
        $barber->avg_rating    = Review::where('barber_id', $barber->id)->avg('rating_barber') ?? 0;
        $barber->save();

        return response()->json($review, 201);
    }
}
