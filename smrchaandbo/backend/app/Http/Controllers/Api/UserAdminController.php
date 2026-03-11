<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserAdminController extends Controller
{
    /**
     * GET /api/users (admin only)
     * Optional query:
     *   - search: filter by name/email (LIKE)
     */
    public function index(Request $request)
    {
        $q = User::query()
            ->withCount(['planners', 'orders']);

        if ($search = trim((string) $request->query('search', ''))) {
            $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // default order newest first
        $users = $q->orderByDesc('id')->get();

        // eksplicitno izbacujemo enum value da ne dođe do problema u frontendu
        $payload = $users->map(function ($u) {
            return [
                'id'              => $u->id,
                'name'            => $u->name,
                'email'           => $u->email,
                'role'            => $u->role?->value, // enum -> string ('admin'|'customer')
                'planners_count'  => $u->planners_count ?? 0,
                'orders_count'    => $u->orders_count ?? 0,
                'created_at'      => $u->created_at?->toISOString(),
            ];
        });

        return response()->json($payload);
    }
}