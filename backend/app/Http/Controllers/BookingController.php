<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BusinessHour;
use App\Models\Coupon;
use App\Models\Promo;
use App\Models\Service;
use App\Models\Barber;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * GET /api/queue
     * Tampilkan antrian hari ini (dipakai untuk layar antrian real-time).
     */
    public function queue(Request $request)
    {
        $today = now()->toDateString();

        $queue = Booking::with(['customer', 'barber', 'service'])
            ->whereDate('booking_date', $today)
            ->orderBy('queue_number')
            ->get();

        return response()->json($queue);
    }

    /**
     * POST /api/bookings
     * Customer membuat booking + ambil nomor antrian.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'barber_id'    => 'required|exists:barbers,id',
            'service_id'   => 'required|exists:services,id',
            'hairstyle_id' => 'nullable|exists:hairstyles,id',
            'scheduled_at' => 'required|date',
            'coupon_code'  => 'nullable|string',
        ]);

        $scheduledAt = Carbon::parse($data['scheduled_at']);

        // 1. Validasi jam buka (07:00–21:00, via business_hours)
        if (!$this->isWithinBusinessHours($scheduledAt)) {
            return response()->json([
                'message' => 'Booking di luar jam operasional. Barbershop buka 07:00–21:00.',
            ], 422);
        }

        $bookingDate = $scheduledAt->toDateString();

        // 2. Hitung queue_number harian (reset per hari)
        $lastQueue = Booking::whereDate('booking_date', $bookingDate)->max('queue_number');
        $queueNumber = $lastQueue ? $lastQueue + 1 : 1;

        $service = Service::findOrFail($data['service_id']);
        $barber  = Barber::findOrFail($data['barber_id']);

        // 3. Harga dasar = service + base price barber (+ premium skill), lalu promo/kupon
        $price = $this->calculateBasePrice($service, $barber, $bookingDate);

        // 4. Kupon loyalty (kalau diisi)
        $appliedCoupon = null;
        if (!empty($data['coupon_code'])) {
            $appliedCoupon = Coupon::where('code', $data['coupon_code'])
                ->where('user_id', $user->id)
                ->where('is_used', false)
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
                })
                ->first();

            if (!$appliedCoupon) {
                return response()->json([
                    'message' => 'Kupon tidak valid atau sudah kadaluarsa.',
                ], 422);
            }

            $price = $price * (100 - $appliedCoupon->discount_percent) / 100;
        }

        $booking = Booking::create([
            'customer_id'    => $user->id,
            'barber_id'      => $data['barber_id'],
            'service_id'     => $data['service_id'],
            'hairstyle_id'   => $data['hairstyle_id'] ?? null,
            'queue_number'   => $queueNumber,
            'booking_date'   => $bookingDate,
            'scheduled_at'   => $scheduledAt,
            'status'         => 'waiting',
            'total_price'    => $price,
            'coupon_id'      => $appliedCoupon?->id,
            'payment_status' => 'unpaid',
        ]);

        // kirim kembali booking beserta relasi agar frontend langsung punya barber/service terpilih
        $booking->load([
            'barber.user',
            'service',
            'hairstyle',
            'payment',
        ]);

        return response()->json($booking, 201);
    }

    /**
     * GET /api/bookings/my
     * Booking milik customer yang login.
     */
    public function myBookings(Request $request)
    {
        $user = $request->user();

        $bookings = Booking::with([
                'barber.user',   // supaya dapat nama barber dari user
                'service',
                'hairstyle',
                'review',
                'payment',       // 1 payment terbaru (relasi latestOfMany)
            ])
            ->where('customer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * PUT /api/bookings/{booking}
     * Customer mengubah jadwal/layanan sebelum dikerjakan.
     */
    public function update(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (in_array($booking->status, ['in_progress', 'done', 'cancelled'], true)) {
            return response()->json([
                'message' => 'Booking sedang dikerjakan/sudah selesai atau dibatalkan dan tidak bisa diubah.',
            ], 422);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'message' => 'Booking yang sudah dibayar tidak bisa diubah.',
            ], 422);
        }

        $data = $request->validate([
            'barber_id'    => 'sometimes|required|exists:barbers,id',
            'service_id'   => 'sometimes|required|exists:services,id',
            'hairstyle_id' => 'nullable|exists:hairstyles,id',
            'scheduled_at' => 'sometimes|required|date',
            'coupon_code'  => 'nullable|string',
        ]);

        $scheduledAt = isset($data['scheduled_at'])
            ? Carbon::parse($data['scheduled_at'])
            : Carbon::parse($booking->scheduled_at);

        if (!$this->isWithinBusinessHours($scheduledAt)) {
            return response()->json([
                'message' => 'Booking di luar jam operasional. Barbershop buka 07:00-21:00.',
            ], 422);
        }

        $barberId = $data['barber_id'] ?? $booking->barber_id;
        $serviceId = $data['service_id'] ?? $booking->service_id;
        $hairstyleId = array_key_exists('hairstyle_id', $data)
            ? $data['hairstyle_id']
            : $booking->hairstyle_id;

        $bookingDate = $scheduledAt->toDateString();
        $queueNumber = $bookingDate === $booking->booking_date->toDateString()
            ? $booking->queue_number
            : $this->nextQueueNumber($scheduledAt);

        $service = Service::findOrFail($serviceId);
        $barber = Barber::findOrFail($barberId);

        $price = $this->calculateBasePrice($service, $barber, $bookingDate);

        $couponId = $booking->coupon_id;
        if (!empty($data['coupon_code'])) {
            $appliedCoupon = Coupon::where('code', $data['coupon_code'])
                ->where('user_id', $user->id)
                ->where('is_used', false)
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>=', now());
                })
                ->first();

            if (!$appliedCoupon) {
                return response()->json([
                    'message' => 'Kupon tidak valid atau sudah kadaluarsa.',
                ], 422);
            }

            $couponId = $appliedCoupon->id;
            $price = $price * (100 - $appliedCoupon->discount_percent) / 100;
        }

        $booking->fill([
            'barber_id'    => $barberId,
            'service_id'   => $serviceId,
            'hairstyle_id' => $hairstyleId,
            'queue_number' => $queueNumber,
            'booking_date' => $bookingDate,
            'scheduled_at' => $scheduledAt,
            'total_price'  => $price,
            'coupon_id'    => $couponId,
        ]);

        $booking->save();

        $booking->load([
            'barber.user',
            'service',
            'hairstyle',
            'payment',
        ]);

        return response()->json($booking);
    }

    /**
     * DELETE /api/bookings/{booking}
     * Customer membatalkan booking (soft delete).
     */
    public function destroy(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (in_array($booking->status, ['in_progress', 'done', 'cancelled'], true)) {
            return response()->json([
                'message' => 'Booking sedang dikerjakan/sudah selesai dan tidak bisa dibatalkan.',
            ], 422);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'message' => 'Booking yang sudah dibayar tidak bisa dibatalkan.',
            ], 422);
        }

        $booking->status = 'cancelled';

        if ($booking->payment_status === 'pending') {
            $booking->payment_status = 'failed';
        }

        $booking->save();

        $booking->load([
            'barber.user',
            'service',
            'hairstyle',
            'payment',
        ]);

        return response()->json([
            'message' => 'Booking dibatalkan.',
            'booking' => $booking,
        ]);
    }

    /**
     * PATCH /api/bookings/{booking}/status
     * Update status booking (waiting -> ongoing -> completed/cancelled).
     * Role: admin/barber.
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Normalisasi status supaya konsisten dengan enum di DB (waiting, in_progress, done, cancelled)
        $rawStatus = $request->input('status');
        $normalizedMap = [
            'ongoing'   => 'in_progress',
            'completed' => 'done',
        ];

        $status = $normalizedMap[$rawStatus] ?? $rawStatus;
        $allowed = ['waiting', 'in_progress', 'done', 'cancelled'];

        if (!in_array($status, $allowed, true)) {
            return response()->json(['message' => 'Status tidak valid'], 422);
        }

        if (!in_array($user->role, ['admin', 'barber'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $booking->status = $status;

        // Kalau baru selesai (completed pertama kali)
        if ($status === 'done' && !$booking->finished_at) {
            $booking->finished_at = now();

            // Tambah loyalty customer
            $customer = $booking->customer;
            if ($customer) {
                $customer->increment('loyalty_count');

                // Setiap kelipatan 7 => kupon loyalty 25%
                if ($customer->loyalty_count % 7 === 0) {
                    $this->issueLoyaltyCoupon($customer->id);
                }
            }

            // Update statistik barber
            $barber = $booking->barber;
            if ($barber) {
                $barber->increment('total_completed_orders');
                $barber->save();
            }
        }

        $booking->save();

        return response()->json($booking);
    }

    // ===== Helper internal =====

    /**
     * Hitung harga booking berdasarkan service + base price barber.
     * Harga service tetap jadi dasar, barber menambah start price,
     * dan skill level hanya menaikkan porsi harga service (bukan base barber).
     */
    protected function calculateBasePrice(Service $service, Barber $barber, string $bookingDate): float
    {
        $serviceBase = (float) $service->base_price;
        $barberBase  = (float) ($barber->base_price ?? 0);

        $price = $serviceBase + $barberBase;

        $skill = strtolower((string) $barber->skill_level);
        if ($skill === 'senior') {
            $price += 0.2 * $serviceBase;
        } elseif ($skill === 'master') {
            $price += 0.4 * $serviceBase;
        }

        return $this->applyPromo($price, $bookingDate, $service->id);
    }

    protected function isWithinBusinessHours(Carbon $datetime): bool
    {
        $dayOfWeek = $datetime->dayOfWeek; // 0 = Sunday

        $bh = BusinessHour::where('day_of_week', $dayOfWeek)->first();

        if (!$bh || $bh->is_closed) {
            return false;
        }

        $open  = Carbon::parse($datetime->toDateString() . ' ' . $bh->open_time);
        $close = Carbon::parse($datetime->toDateString() . ' ' . $bh->close_time);

        return $datetime->between($open, $close);
    }

    protected function nextQueueNumber(Carbon $datetime): int
    {
        $bookingDate = $datetime->toDateString();
        $lastQueue = Booking::whereDate('booking_date', $bookingDate)->max('queue_number');

        return $lastQueue ? $lastQueue + 1 : 1;
    }

    protected function applyPromo(float $price, string $bookingDate, int $serviceId): float
    {
        $date = Carbon::parse($bookingDate);
        $dayOfWeek = $date->dayOfWeek;

        $promo = Promo::where('is_active', true)
            ->where(function ($q) use ($dayOfWeek) {
                $q->whereNull('day_of_week')
                  ->orWhere('day_of_week', $dayOfWeek);
            })
            ->where(function ($q) use ($serviceId) {
                $q->whereNull('service_id')
                  ->orWhere('service_id', $serviceId);
            })
            ->first();

        if (!$promo) {
            return $price;
        }

        return $price * (100 - $promo->discount_percent) / 100;
    }

    protected function issueLoyaltyCoupon(int $userId): Coupon
    {
        $code = 'LOYAL-' . strtoupper(str()->random(8));

        return Coupon::create([
            'user_id'          => $userId,
            'code'             => $code,
            'discount_percent' => 25,
            'is_used'          => false,
            'issued_reason'    => 'LOYALTY_7_ORDERS',
            'expires_at'       => now()->addMonth(),
        ]);
    }
}
