<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\Request;

class AdminPayoutController extends Controller
{
    protected function ensureAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

    /**
     * GET /api/admin/payouts
     * List payouts (simulated withdrawals to barbers).
     */
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $payouts = Payout::with('barber.user')
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json($payouts);
    }

    /**
     * POST /api/admin/payouts
     * Admin creates a payout (for example, from internal balance to a barber account).
     */
    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'barber_id'      => 'required|exists:barbers,id',
            'amount'         => 'required|numeric|min:0',
            'channel'        => 'nullable|string|max:50',
            'account_name'   => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'bank_name'      => 'nullable|string|max:100',
            'note'           => 'nullable|string|max:255',
        ]);

        $payout = Payout::create([
            'barber_id'      => $data['barber_id'],
            'amount'         => $data['amount'],
            'channel'        => $data['channel'] ?? 'manual',
            'account_name'   => $data['account_name'] ?? null,
            'account_number' => $data['account_number'] ?? null,
            'bank_name'      => $data['bank_name'] ?? null,
            'status'         => 'requested',
            'requested_at'   => now(),
            'note'           => $data['note'] ?? null,
        ]);

        return response()->json($payout, 201);
    }

    /**
     * PATCH /api/admin/payouts/{payout}
     * Update payout status (requested -> approved/rejected/paid).
     */
    public function updateStatus(Request $request, Payout $payout)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'status' => 'required|in:requested,approved,rejected,paid',
            'note'   => 'nullable|string|max:255',
        ]);

        $payout->status = $data['status'];

        if (in_array($data['status'], ['approved', 'rejected', 'paid']) && !$payout->processed_at) {
            $payout->processed_at = now();
        }

        if (array_key_exists('note', $data)) {
            $payout->note = $data['note'];
        }

        $payout->save();

        return response()->json($payout);
    }

    /**
     * GET /api/admin/payouts/{payout}
     */
    public function show(Request $request, Payout $payout)
    {
        $this->ensureAdmin($request);

        $payout->load('barber.user');

        return response()->json($payout);
    }

    /**
     * DELETE /api/admin/payouts/{payout}
     * Remove a payout from the simulation history.
     */
    public function destroy(Request $request, Payout $payout)
    {
        $this->ensureAdmin($request);

        $payout->delete();

        return response()->json([
            'message' => 'Payout deleted successfully.',
        ]);
    }
}
