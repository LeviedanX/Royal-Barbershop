<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * GET /api/services
     * List all services (used by customers when picking packages/bundles).
     */
    public function index()
    {
        $services = Service::all();

        return response()->json($services);
    }

    /**
     * GET /api/services/{service}
     * Detail for a service, including related default hairstyles if needed.
     */
    public function show(Service $service)
    {
        $service->load('hairstyles');

        return response()->json($service);
    }

    /**
     * (Optional) POST /api/services
     * Can be used by admin to add services from the dashboard.
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
     * (Optional) PUT /api/services/{service}
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
     * (Optional) DELETE /api/services/{service}
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
