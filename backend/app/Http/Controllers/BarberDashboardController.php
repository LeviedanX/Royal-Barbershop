<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Review;
use Illuminate\Http\Request;

class BarberDashboardController extends Controller
{
    /**
     * GET /api/barber/dashboard
     * Dashboard data for the authenticated barber.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'barber') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $barber = Barber::where('user_id', $user->id)->first();
        if (!$barber) {
            return response()->json(['message' => 'Barber profile not found'], 404);
        }

        $today = now()->toDateString();

        // Active queue (today and upcoming) for this barber
        $queueBookings = Booking::with(['customer', 'service', 'payment'])
            ->where('barber_id', $barber->id)
            ->whereDate('booking_date', '>=', $today)
            ->orderBy('booking_date')
            ->orderBy('queue_number')
            ->get();

        // Booking history (latest 50)
        $history = Booking::with(['customer', 'service', 'payment'])
            ->where('barber_id', $barber->id)
            ->orderByDesc('scheduled_at')
            ->limit(50)
            ->get();

        // Reviews for this barber
        $reviewList = Review::with(['customer', 'booking.service'])
            ->where('barber_id', $barber->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $todayQueueCount    = $queueBookings->where('booking_date', $today)->whereIn('status', ['waiting', 'in_progress'])->count();
        $todayFinishedCount = $queueBookings->where('booking_date', $today)->where('status', 'done')->count();

        // Income today: transactions that are settlement/capture
        $todayIncome = Payment::whereIn('transaction_status', ['capture', 'settlement'])
            ->whereHas('booking', function ($q) use ($barber, $today) {
                $q->where('barber_id', $barber->id)
                  ->whereDate('booking_date', $today);
            })
            ->sum('gross_amount');

        // Average rating from barber reviews
        $avgRating = Review::where('barber_id', $barber->id)->avg('rating_barber');

        $queueList = $queueBookings->map(function (Booking $b) {
            return [
                'id'             => $b->id,
                'code'           => $b->code ?? null,
                'queue_number'   => $b->queue_number,
                'customer_name'  => $b->customer?->name,
                'service_name'   => $b->service?->name,
                'time_label'     => $b->scheduled_at?->format('d M H:i'),
                'time'           => $b->scheduled_at,
                'status'         => $b->status,
                'payment_type'   => $b->payment?->payment_type,
                'payment_status' => $b->payment_status,
                'amount'         => $b->total_price,
            ];
        });

        $historyBookings = $history->map(function (Booking $b) {
            return [
                'id'             => $b->id,
                'date_label'     => $b->scheduled_at?->format('d M Y H:i'),
                'customer_name'  => $b->customer?->name,
                'service_name'   => $b->service?->name,
                'status'         => $b->status,
                'payment_status' => $b->payment_status,
                'amount'         => $b->total_price,
            ];
        });

        $reviews = $reviewList->map(function (Review $r) {
            return [
                'id'            => $r->id,
                'customer_name' => $r->customer?->name,
                'rating'        => $r->rating_barber ?? $r->rating_shop,
                'comment'       => $r->comment,
                'service_name'  => $r->booking?->service?->name,
                'created_at'    => $r->created_at,
            ];
        });

        return response()->json([
            'barber' => $barber->load('user'),
            'stats' => [
                'todayQueue'    => $todayQueueCount,
                'todayFinished' => $todayFinishedCount,
                'todayIncome'   => (float) $todayIncome,
                'avgRating'     => $avgRating ? round((float) $avgRating, 2) : null,
            ],
            // For UI compatibility: keep todayBookings as active queue (today + upcoming)
            'todayBookings'   => $queueList,
            'historyBookings' => $historyBookings,
            'reviews'         => $reviews,
        ]);
    }
}
