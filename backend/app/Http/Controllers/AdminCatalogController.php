<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Hairstyle;
use App\Models\Coupon;
use App\Models\Promo;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminCatalogController extends Controller
{
    protected function ensureAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

    // ===== SERVICES CRUD =====

    public function indexServices(Request $request)
    {
        $this->ensureAdmin($request);

        return response()->json(Service::all());
    }

    public function storeService(Request $request)
    {
        $this->ensureAdmin($request);

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

    public function updateService(Request $request, Service $service)
    {
        $this->ensureAdmin($request);

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

    public function destroyService(Request $request, Service $service)
    {
        $this->ensureAdmin($request);

        $service->delete();

        return response()->json(['message' => 'Service deleted']);
    }

    // ===== HAIRSTYLES CRUD =====

    public function indexHairstyles(Request $request)
    {
        $this->ensureAdmin($request);

        // with('defaultService') -> di JSON akan muncul sebagai "default_service"
        $hairstyles = Hairstyle::with('defaultService')->get();

        return response()->json($hairstyles);
    }

    public function storeHairstyle(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'image_url'          => 'required|string|max:2048',
            'description'        => 'nullable|string',
            'default_service_id' => 'nullable|exists:services,id',
        ]);

        $hairstyle = Hairstyle::create($data);

        return response()->json($hairstyle, 201);
    }

    public function updateHairstyle(Request $request, Hairstyle $hairstyle)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'               => 'sometimes|string|max:255',
            'image_url'          => 'sometimes|string|max:2048',
            'description'        => 'sometimes|nullable|string',
            'default_service_id' => 'sometimes|nullable|exists:services,id',
        ]);

        $hairstyle->update($data);

        return response()->json($hairstyle);
    }

    public function destroyHairstyle(Request $request, Hairstyle $hairstyle)
    {
        $this->ensureAdmin($request);

        $hairstyle->delete();

        return response()->json(['message' => 'Hairstyle deleted']);
    }

    // ===== COUPONS CRUD =====

    public function indexCoupons(Request $request)
    {
        $this->ensureAdmin($request);

        $coupons = Coupon::with('user')->orderBy('id', 'desc')->get();

        return response()->json($coupons);
    }

    public function storeCoupon(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'user_id'          => 'required|exists:users,id',
            'code'             => 'required|string|max:50|unique:coupons,code',
            'discount_percent' => 'required|integer|min:1|max:100',
            'expires_at'       => 'nullable|date',
            'issued_reason'    => 'nullable|string|max:255',
        ]);

        $coupon = Coupon::create([
            'user_id'          => $data['user_id'],
            'code'             => $data['code'],
            'discount_percent' => $data['discount_percent'],
            'is_used'          => false,
            'expires_at'       => $data['expires_at'] ?? null,
            'issued_reason'    => $data['issued_reason'] ?? null,
        ]);

        return response()->json($coupon, 201);
    }

    public function updateCoupon(Request $request, Coupon $coupon)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'discount_percent' => 'sometimes|integer|min:1|max:100',
            'is_used'          => 'sometimes|boolean',
            'expires_at'       => 'sometimes|nullable|date',
            'issued_reason'    => 'sometimes|nullable|string|max:255',
        ]);

        $coupon->update($data);

        return response()->json($coupon);
    }

    public function destroyCoupon(Request $request, Coupon $coupon)
    {
        $this->ensureAdmin($request);

        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted']);
    }

    // ===== PROMOS CRUD =====

    public function indexPromos(Request $request)
    {
        $this->ensureAdmin($request);

        $promos = Promo::with('service')->orderBy('id', 'desc')->get();

        return response()->json($promos);
    }

    public function storePromo(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'day_of_week'      => 'nullable|integer|min:0|max:6',
            'discount_percent' => 'required|integer|min:1|max:100',
            'service_id'       => 'nullable|exists:services,id',
            'is_active'        => 'boolean',
        ]);

        $promo = Promo::create($data);

        return response()->json($promo, 201);
    }

    public function updatePromo(Request $request, Promo $promo)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'description'      => 'sometimes|nullable|string',
            'day_of_week'      => 'sometimes|nullable|integer|min:0|max:6',
            'discount_percent' => 'sometimes|integer|min:1|max:100',
            'service_id'       => 'sometimes|nullable|exists:services,id',
            'is_active'        => 'sometimes|boolean',
        ]);

        $promo->update($data);

        return response()->json($promo);
    }

    public function destroyPromo(Request $request, Promo $promo)
    {
        $this->ensureAdmin($request);

        $promo->delete();

        return response()->json(['message' => 'Promo deleted']);
    }

    // ===== REVIEWS (read & delete) =====

    public function indexReviews(Request $request)
    {
        $this->ensureAdmin($request);

        $reviews = Review::with(['booking.customer', 'booking.barber'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function destroyReview(Request $request, Review $review)
    {
        $this->ensureAdmin($request);

        $review->delete();

        return response()->json(['message' => 'Review deleted']);
    }
}
