<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\UserRole;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || $user->role !== UserRole::ADMIN) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        return $next($request);
    }
}
