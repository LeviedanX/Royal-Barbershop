<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Illuminate\Http\Request;

class AdminAccessLogController extends Controller
{
    protected function ensureAdmin(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }


    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $logs = AccessLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get()
            ->map(function ($log) {
                return [
                    'id'          => $log->id,
                    'user_name'   => optional($log->user)->name,
                    'user_email'  => optional($log->user)->email,
                    'ip_address'  => $log->ip,           // kolom di DB: ip ➜ frontend: ip_address
                    'method'      => $log->method,
                    'path'        => $log->path,
                    'user_agent'  => $log->user_agent,
                    'created_at'  => $log->created_at?->toDateTimeString(),
                ];
            });

        return response()->json($logs);
    }

    public function destroy(Request $request, AccessLog $accessLog)
    {
        $this->ensureAdmin($request);
        $accessLog->delete();

        return response()->json(['message' => 'Access log deleted']);
    }

    public function clearAll(Request $request)
    {
        $this->ensureAdmin($request);
        AccessLog::truncate();

        return response()->json(['message' => 'All access logs cleared']);
    }
}
