<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPaymentController extends Controller
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

        $payments = Payment::with([
                'booking.customer',
                'booking.barber',
                'booking.service',
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json($payments);
    }

    public function show(Request $request, Payment $payment)
    {
        $this->ensureAdmin($request);

        $payment->load(['booking.customer', 'booking.barber', 'booking.service']);

        return response()->json($payment);
    }

    public function destroy(Request $request, Payment $payment)
    {
        $this->ensureAdmin($request);

        // Optional: validate status before deleting (e.g., block deleting settled payments)
        // if (in_array($payment->transaction_status, ['settlement', 'capture'])) {
        //     return response()->json(['message' => 'Do not delete payments that are already settled'], 422);
        // }

        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted',
        ]);
    }

    /**
     * Admin creates a manual payment (for example, offline/adjustment).
     */
    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'booking_id'         => 'required|exists:bookings,id',
            'midtrans_order_id'  => 'nullable|string|max:255|unique:payments,midtrans_order_id',
            'payment_type'       => 'nullable|string|max:100',
            'gross_amount'       => 'required|numeric|min:0',
            'transaction_status' => 'required|string|max:100',
            'transaction_time'   => 'nullable|date',
            'fraud_status'       => 'nullable|string|max:100',
            'snap_token'         => 'nullable|string|max:255',
            'raw_response'       => 'nullable|array',
        ]);

        $booking = Booking::findOrFail($data['booking_id']);

        $orderId = $data['midtrans_order_id'] ?? ('MANUAL-' . $booking->id . '-' . time());

        $payment = Payment::create([
            'booking_id'         => $booking->id,
            'midtrans_order_id'  => $orderId,
            'payment_type'       => $data['payment_type'] ?? null,
            'gross_amount'       => $data['gross_amount'],
            'transaction_status' => $data['transaction_status'],
            'transaction_time'   => $data['transaction_time'] ?? null,
            'fraud_status'       => $data['fraud_status'] ?? null,
            'snap_token'         => $data['snap_token'] ?? null,
            'raw_response'       => $data['raw_response'] ?? null,
        ]);

        $this->syncBookingPaymentStatus($payment);

        return response()->json($payment->load(['booking.customer', 'booking.barber', 'booking.service']), 201);
    }

    /**
     * Admin updates payment data (status/date/amount).
     */
    public function update(Request $request, Payment $payment)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'payment_type'       => 'sometimes|nullable|string|max:100',
            'gross_amount'       => 'sometimes|numeric|min:0',
            'transaction_status' => 'sometimes|string|max:100',
            'transaction_time'   => 'sometimes|nullable|date',
            'fraud_status'       => 'sometimes|nullable|string|max:100',
            'snap_token'         => 'sometimes|nullable|string|max:255',
            'raw_response'       => 'sometimes|nullable|array',
        ]);

        $payment->update($data);
        $this->syncBookingPaymentStatus($payment);

        return response()->json($payment->load(['booking.customer', 'booking.barber', 'booking.service']));
    }

    protected function syncBookingPaymentStatus(Payment $payment): void
    {
        $booking = $payment->booking;
        if (!$booking) {
            return;
        }

        $status = $payment->transaction_status;
        $fraud  = $payment->fraud_status;

        if (in_array($status, ['capture', 'settlement']) && $fraud !== 'challenge') {
            $booking->payment_status = 'paid';
        } elseif (in_array($status, ['cancel', 'deny', 'expire'])) {
            $booking->payment_status = 'failed';
        } else {
            $booking->payment_status = 'pending';
        }

        $booking->save();
    }
}
