<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * GET /api/services
     * List semua layanan (bisa dipakai customer saat pilih paket potong, bundling, dll).
     */
    public function index()
    {
        $services = Service::all();

        return response()->json($services);
    }

    /**
     * GET /api/services/{service}
     * Detail satu layanan, termasuk relasi ke hairstyles default (kalau mau).
     */
    public function show(Service $service)
    {
        $service->load('hairstyles');

        return response()->json($service);
    }

    /**
     * (Opsional) POST /api/services
     * Bisa kamu pakai untuk admin menambah layanan dari dashboard.
     * Kalau belum butuh untuk UAS, endpoint ini boleh nggak dipakai di routes.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'base_price'       => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:0',
            'is_bundle'        => 'boolean',
        ]);

        $service = Service::create($data);

        return response()->json($service, 201);
    }

    /**
     * (Opsional) PUT /api/services/{service}
     */
    public function update(Request $request, Service $service)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'description'      => 'sometimes|nullable|string',
            'base_price'       => 'sometimes|numeric|min:0',
            'duration_minutes' => 'sometimes|integer|min:0',
            'is_bundle'        => 'sometimes|boolean',
        ]);

        $service->update($data);

        return response()->json($service);
    }

    /**
     * (Opsional) DELETE /api/services/{service}
     */
    public function destroy(Request $request, Service $service)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $service->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
