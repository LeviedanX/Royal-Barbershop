<?php

namespace App\Http\Controllers;

use App\Models\CsMessage;
use App\Models\CsTicket;
use Illuminate\Http\Request;

class CustomerServiceController extends Controller
{
    /**
     * GET /api/cs/tickets
     * Admin: semua tiket, Customer: tiket milik sendiri.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = CsTicket::with('user')
            ->orderBy('created_at', 'desc');

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get());
    }

    /**
     * POST /api/cs/tickets
     * Customer buat tiket + pesan pertama.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        $ticket = CsTicket::create([
            'user_id' => $user->id,
            'subject' => $data['subject'],
            'status'  => 'open',
        ]);

        CsMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'message'   => $data['message'],
        ]);

        return response()->json(
            $ticket->load(['user', 'messages.sender']),
            201
        );
    }

    /**
     * GET /api/cs/tickets/{ticket}
     * Detail tiket + semua pesan.
     */
    public function show(Request $request, CsTicket $ticket)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(
            $ticket->load(['user', 'admin', 'messages.sender'])
        );
    }

    /**
     * POST /api/cs/tickets/{ticket}/reply
     * Reply tiket oleh customer atau admin.
     */
    public function reply(Request $request, CsTicket $ticket)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'message' => 'required|string',
        ]);

        $msg = CsMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'message'   => $data['message'],
        ]);

        if ($user->role === 'admin') {
            $ticket->status   = 'answered';
            $ticket->admin_id = $user->id;
            $ticket->save();
        }

        return response()->json($msg, 201);
    }
}
