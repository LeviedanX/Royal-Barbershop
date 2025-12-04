<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/register
     * Optional: register a new user (default role = customer).
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed', // butuh field password_confirmation
            'phone'    => 'nullable|string|max:20',
            'role'     => 'nullable|in:admin,barber,customer',
        ]);

        $user = User::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'phone'         => $data['phone'] ?? null,
            'role'          => $data['role'] ?? 'customer',
            'loyalty_count' => 0,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * POST /api/login
     * Login with email + password, return Sanctum token.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email or password is incorrect.'],
            ]);
        }

        // (Optional) delete old tokens if you want single-device auth:
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log the login to keep an audit trail for all roles
        try {
            AccessLog::create([
                'user_id'    => $user->id,
                'method'     => $request->method(),
                'path'       => $request->path(),
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Do not let logging failures block login
        }

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * GET /api/me
     * Current authenticated user data.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * POST /api/logout
     * Logout the current token (SPA/React).
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Hapus hanya token saat ini
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out',
        ]);
    }
}
