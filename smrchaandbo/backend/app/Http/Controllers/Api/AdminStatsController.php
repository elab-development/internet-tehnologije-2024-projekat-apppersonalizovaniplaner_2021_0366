<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Models\User;
use App\Models\Planner;
use App\Models\Order;

class AdminStatsController extends Controller
{
    /**
     * GET /api/admin/stats
     * Admin overview metrics + charts
     * Query params:
     *   range = 30d | 90d | 12m (default 30d)
     */
    public function overview(Request $request)
    {
        $range = $request->query('range', '30d'); // 30d, 90d, 12m
        $now   = Carbon::now();

        // Resolve time window + grouping
        if ($range === '12m') {
            $start   = $now->copy()->subMonthsNoOverflow(12)->startOfMonth();
            $groupFn = fn($col) => DB::raw("DATE_FORMAT($col, '%Y-%m-01') as bucket");
            $orderBy = 'bucket';
        } else {
            // fallback 30d / 90d -> group by day
            $days    = $range === '90d' ? 90 : 30;
            $start   = $now->copy()->subDays($days)->startOfDay();
            $groupFn = fn($col) => DB::raw("DATE($col) as bucket");
            $orderBy = 'bucket';
        }

        // Totals
        $usersCount     = User::count();
        $adminsCount    = User::where('role', 'admin')->count();
        $customersCount = User::where('role', 'customer')->count();
        $plannersCount  = Planner::count();

        $ordersCount     = Order::count();
        $paidOrdersCount = Order::where('payment_status', 'paid')->count();
        $revenueTotal    = (float) Order::where('payment_status', 'paid')->sum('total');

        // recent revenue (last 30d regardless of range)
        $revenue30d = (float) Order::where('payment_status', 'paid')
            ->where('placed_at', '>=', $now->copy()->subDays(30))
            ->sum('total');

        $avgOrderValue = $paidOrdersCount > 0 ? round($revenueTotal / $paidOrdersCount, 2) : 0.0;

        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->pluck('cnt', 'status');

        // Revenue series (sum per bucket within window)
        $revenueSeries = Order::select($groupFn('placed_at'))
            ->selectRaw('SUM(CASE WHEN payment_status="paid" THEN total ELSE 0 END) as revenue')
            ->where('placed_at', '>=', $start)
            ->groupBy('bucket')
            ->orderBy($orderBy)
            ->get()
            ->map(fn($r) => [
                'date'    => $r->bucket,
                'revenue' => (float) $r->revenue,
            ]);

        // Orders count series (per bucket)
        $ordersSeries = Order::select($groupFn('placed_at'))
            ->selectRaw('COUNT(*) as orders_count')
            ->where('placed_at', '>=', $start)
            ->groupBy('bucket')
            ->orderBy($orderBy)
            ->get()
            ->map(fn($r) => [
                'date'         => $r->bucket,
                'orders_count' => (int) $r->orders_count,
            ]);

        // Top templates (by number of planners)
        $topTemplates = Planner::select('template_id', DB::raw('COUNT(*) as cnt'))
            ->whereNotNull('template_id')
            ->groupBy('template_id')
            ->orderByDesc('cnt')
            ->with('template:id,name')
            ->limit(7)
            ->get()
            ->map(fn($p) => [
                'template_id' => $p->template_id,
                'name'        => optional($p->template)->name ?? ('#' . $p->template_id),
                'count'       => (int) $p->cnt,
            ]);

        // Recent orders (last 10)
        $recentOrders = Order::with(['user:id,name,email', 'planner:id,title'])
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(fn($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'status'         => $o->status,
                'payment_status' => $o->payment_status,
                'total'          => (float) $o->total,
                'placed_at'      => $o->placed_at,
                'user'           => $o->user ? [
                    'id'    => $o->user->id,
                    'name'  => $o->user->name,
                    'email' => $o->user->email,
                ] : null,
                'planner'        => $o->planner ? [
                    'id'    => $o->planner->id,
                    'title' => $o->planner->title,
                ] : null,
            ]);

        return response()->json([
            'range' => $range,
            'totals' => [
                'users'      => $usersCount,
                'admins'     => $adminsCount,
                'customers'  => $customersCount,
                'planners'   => $plannersCount,
                'orders'     => $ordersCount,
                'paid_orders' => $paidOrdersCount,
                'revenue_total' => $revenueTotal,
                'revenue_30d'   => $revenue30d,
                'aov'           => $avgOrderValue,
            ],
            'orders_by_status' => $ordersByStatus, // {pending: n, ...}
            'series' => [
                'revenue' => $revenueSeries,      // [{date, revenue}]
                'orders'  => $ordersSeries,       // [{date, orders_count}]
            ],
            'top_templates' => $topTemplates,      // [{template_id,name,count}]
            'recent_orders' => $recentOrders,      // last 10
        ]);
    }
}