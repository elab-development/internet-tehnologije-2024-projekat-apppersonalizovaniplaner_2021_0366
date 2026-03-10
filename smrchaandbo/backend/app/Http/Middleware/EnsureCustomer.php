<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\UserRole;

class EnsureCustomer
{
    /**
     * Allow only users with role 'customer'.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role !== UserRole::CUSTOMER) {
            return response()->json(['message' => 'Only customers can create planners.'], 403);
        }

        return $next($request);
    }
}
