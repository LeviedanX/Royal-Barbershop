<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * GET /api/announcements
     * Ambil pengumuman aktif untuk role user saat ini.
     */
    public function index(Request $request)
    {
        $role = $request->user()->role ?? 'customer';
        $now  = now();

        $ann = Announcement::where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')
                  ->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')
                  ->orWhere('ends_at', '>=', $now);
            })
            ->where(function ($q) use ($role) {
                $q->where('target_role', 'all')
                  ->orWhere('target_role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ann);
    }

    /**
     * POST /api/announcements
     * Admin membuat pengumuman.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title'       => 'required|string',
            'content'     => 'required|string',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
            'target_role' => 'nullable|in:all,admin,barber,customer',
            'is_active'   => 'nullable|boolean',
        ]);

        $announcement = Announcement::create([
            'title'       => $data['title'],
            'content'     => $data['content'],
            'starts_at'   => $data['starts_at'] ?? null,
            'ends_at'     => $data['ends_at'] ?? null,
            'target_role' => $data['target_role'] ?? 'all',
            'is_active'   => $data['is_active'] ?? true,
        ]);

        return response()->json($announcement, 201);
    }

    /**
     * PUT /api/announcements/{announcement}
     */
    public function update(Request $request, Announcement $announcement)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title'       => 'sometimes|string',
            'content'     => 'sometimes|string',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
            'target_role' => 'nullable|in:all,admin,barber,customer',
            'is_active'   => 'nullable|boolean',
        ]);

        $announcement->update($data);

        return response()->json($announcement);
    }

    /**
     * DELETE /api/announcements/{announcement}
     */
    public function destroy(Request $request, Announcement $announcement)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
