<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Barber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    protected function ensureAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

    // ===== BARBER CRUD =====

    public function indexBarbers(Request $request)
    {
        $this->ensureAdmin($request);

        $barbers = Barber::with('user')->orderBy('id', 'asc')->get();

        return response()->json($barbers);
    }

    public function storeBarber(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'         => 'required|string|max:255', // user full name
            'email'        => 'required|email|unique:users,email',
            'phone'        => 'nullable|string|max:20',
            'password'     => 'required|string|min:6',
            'display_name' => 'required|string|max:255',
            'skill_level'  => 'nullable|string|max:100',
            'base_price'   => 'nullable|numeric|min:0',
        ]);

        // Normalize skill_level to match the DB enum
        // Enum in migration: ['junior', 'senior', 'master']
        $allowedLevels = ['junior', 'senior', 'master'];

        $rawSkill = isset($data['skill_level'])
            ? strtolower(trim($data['skill_level']))
            : null;

        if ($rawSkill && in_array($rawSkill, $allowedLevels, true)) {
            $skillLevel = $rawSkill;
        } else {
            // If admin enters "Advanced", "Top Rated", etc. -> fall back safely
            $skillLevel = 'junior';
        }

        $basePrice = isset($data['base_price']) ? (float) $data['base_price'] : 0;

        // Transaction: if creating the barber fails, rollback the user too
        $result = DB::transaction(function () use ($data, $skillLevel, $basePrice) {
            $user = User::create([
                'name'          => $data['name'],
                'email'         => $data['email'],
                'phone'         => $data['phone'] ?? null,
                'password'      => Hash::make($data['password']),
                'role'          => 'barber',
                'loyalty_count' => 0,
            ]);

            $barber = Barber::create([
                'user_id'      => $user->id,
                'display_name' => $data['display_name'],
                'skill_level'  => $skillLevel,
                'base_price'   => $basePrice,
            ]);

            return [
                'user'   => $user,
                'barber' => $barber,
            ];
        });

        return response()->json($result, 201);
    }

    public function updateBarber(Request $request, Barber $barber)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'display_name' => 'sometimes|string|max:255',
            'skill_level'  => 'sometimes|nullable|string|max:100',
            'base_price'   => 'sometimes|numeric|min:0',
            'is_active'    => 'sometimes|boolean',
        ]);

        // Normalize skill_level during update to stay within the enum
        if (array_key_exists('skill_level', $data)) {
            $allowedLevels = ['junior', 'senior', 'master'];
            $rawSkill = $data['skill_level'];

            if ($rawSkill === null || $rawSkill === '') {
                $data['skill_level'] = 'junior';
            } else {
                $rawSkill = strtolower(trim($rawSkill));
                $data['skill_level'] = in_array($rawSkill, $allowedLevels, true)
                    ? $rawSkill
                    : 'junior';
            }
        }

        $barber->update($data);

        return response()->json($barber);
    }

    public function destroyBarber(Request $request, Barber $barber)
    {
        $this->ensureAdmin($request);

        // Optionally delete the linked user as well
        $user = $barber->user;
        $barber->delete();
        if ($user && $user->role === 'barber') {
            $user->delete();
        }

        return response()->json(['message' => 'Barber deleted']);
    }

    // ===== CUSTOMER CRUD =====

    public function indexCustomers(Request $request)
    {
        $this->ensureAdmin($request);

        $customers = User::where('role', 'customer')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($customers);
    }

    public function storeCustomer(Request $request)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'phone'         => $data['phone'] ?? null,
            'password'      => Hash::make($data['password']),
            'role'          => 'customer',
            'loyalty_count' => 0,
        ]);

        return response()->json($user, 201);
    }

    public function updateCustomer(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Target is not a customer'], 422);
        }

        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function destroyCustomer(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Target is not a customer'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Customer deleted']);
    }

    // ===== PASSWORD CHANGES (admin, barber, customer) =====

    public function changeMyPassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();

        return response()->json(['message' => 'Password updated']);
    }

    public function adminChangeUserPassword(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'new_password' => 'required|string|min:6',
        ]);

        $user->password = Hash::make($data['new_password']);
        $user->save();

        return response()->json(['message' => 'Password updated by admin']);
    }
}
