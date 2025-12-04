<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected MidtransService $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
    }

    /**
     * POST /api/payments/{booking}/create
     * Buat Snap token untuk pembayaran Midtrans.
     */
    public function createSnap(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Customer cuma boleh bayar booking miliknya
        if ($user->role === 'customer' && $booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Validasi total_price
        if (!$booking->total_price || $booking->total_price <= 0) {
            return response()->json([
                'message' => 'Total harga booking belum di-set atau 0.',
            ], 422);
        }

        // order_id unik
        $orderId = 'BOOK-' . $booking->id . '-' . time();

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $booking->total_price, // Midtrans butuh integer
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
            ],
        ];

        try {
            $snapToken = $this->midtrans->createTransactionToken($params);
        } catch (\Throwable $e) {
            Log::error('Midtrans Snap error', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal membuat Snap token',
                'error'   => $e->getMessage(),
            ], 500);
        }

        // simpan payment baru
        $payment = Payment::create([
            'booking_id'         => $booking->id,
            'midtrans_order_id'  => $orderId,
            'payment_type'       => null,
            'gross_amount'       => $booking->total_price,
            'transaction_status' => 'pending',
            'transaction_time'   => null,
            'fraud_status'       => null,
            'snap_token'         => $snapToken,
            'raw_response'       => null,
        ]);

        // status pembayaran di booking jadi "pending"
        $booking->payment_status = 'pending';
        $booking->save();

        return response()->json([
            'snap_token' => $snapToken,
            'payment'    => $payment,
        ]);
    }

    /**
     * POST /api/payments/{booking}/confirm
     * Dipanggil dari frontend setelah Snap onSuccess/onPending.
     * Akan pull status transaksi ke Midtrans via API.
     */
    public function confirmStatus(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Pastikan customer hanya bisa mengkonfirmasi booking miliknya
        if ($user->role === 'customer' && $booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'order_id' => 'required|string',
        ]);

        $orderId = $data['order_id'];

        // pastikan payment sesuai booking & order_id
        $payment = Payment::where('midtrans_order_id', $orderId)
            ->where('booking_id', $booking->id)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        try {
            $status = $this->midtrans->getTransactionStatus($orderId);
        } catch (\Throwable $e) {
            Log::error('Midtrans status error', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal mengecek status transaksi',
                'error'   => $e->getMessage(),
            ], 500);
        }

        $transactionStatus = $status->transaction_status ?? null;
        $paymentType       = $status->payment_type ?? null;
        $grossAmount       = $status->gross_amount ?? null;
        $fraudStatus       = $status->fraud_status ?? null;
        $transactionTime   = $status->transaction_time ?? null;

        // update payment seperti di callback()
        $payment->payment_type       = $paymentType;
        $payment->transaction_status = $transactionStatus;
        $payment->fraud_status       = $fraudStatus;
        $payment->gross_amount       = $grossAmount ?? $payment->gross_amount;
        $payment->transaction_time   = $transactionTime;
        // konversi ke array supaya cocok dengan casts json->array
        $payment->raw_response       = json_decode(json_encode($status), true);
        $payment->save();

        $bookingModel = $payment->booking;

        if ($bookingModel) {
            if (in_array($transactionStatus, ['capture', 'settlement']) && $fraudStatus !== 'challenge') {
                $bookingModel->payment_status = 'paid';
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $bookingModel->payment_status = 'failed';
            } else {
                $bookingModel->payment_status = 'pending';
            }

            $bookingModel->save();
            $bookingModel->load(['barber.user', 'service', 'hairstyle', 'payment']);
        }

        return response()->json([
            'message'            => 'Payment status updated',
            'payment_status'     => $bookingModel->payment_status ?? null,
            'transaction_status' => $payment->transaction_status,
            'booking'            => $bookingModel ?? null,
        ]);
    }

    /**
     * POST /api/midtrans/callback
     * Endpoint callback/notification dari Midtrans.
     * (Route ini TIDAK pakai auth:sanctum.)
     */
    public function callback(Request $request)
    {
        $payload = $request->all();
        Log::info('Midtrans callback', $payload);

        $orderId           = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $paymentType       = $payload['payment_type'] ?? null;
        $grossAmount       = $payload['gross_amount'] ?? null;
        $fraudStatus       = $payload['fraud_status'] ?? null;
        $transactionTime   = $payload['transaction_time'] ?? null;

        if (!$orderId) {
            return response()->json(['message' => 'No order_id'], 400);
        }

        $payment = Payment::where('midtrans_order_id', $orderId)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->payment_type       = $paymentType;
        $payment->transaction_status = $transactionStatus;
        $payment->fraud_status       = $fraudStatus;
        $payment->gross_amount       = $grossAmount ?? $payment->gross_amount;
        $payment->transaction_time   = $transactionTime;
        $payment->raw_response       = $payload;
        $payment->save();

        $booking = $payment->booking;

        if ($booking) {
            if (in_array($transactionStatus, ['capture', 'settlement']) && $fraudStatus !== 'challenge') {
                $booking->payment_status = 'paid';
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $booking->payment_status = 'failed';
            } else {
                $booking->payment_status = 'pending';
            }

            $booking->save();
            $booking->load(['barber.user', 'service', 'hairstyle', 'payment']);
        }

        return response()->json([
            'message'        => 'OK',
            'booking'        => $booking ?? null,
            'payment_status' => $booking->payment_status ?? null,
        ]);
    }
}
