<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Auth;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => UserRole::CUSTOMER,
        ]);

        Auth::login($user);

        return response()->json([
            'message' => 'Registered & logged in.',
            'user'    => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->value,
            ],
        ], 201);
    }
}
