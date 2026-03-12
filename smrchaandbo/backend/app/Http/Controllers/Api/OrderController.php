<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Models\{
    Order,
    Planner
};

use App\Http\Resources\OrderResource;

class OrderController extends Controller
{
    /** ===== Helpers ===== */

    protected function isAdmin(Request $request): bool
    {
        return $request->user()?->role === 'admin';
    }

    protected function assertOwnerOrAdmin(Request $request, Order $order): void
    {
        $user = $request->user();
        if (!$user) abort(401);
        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }
    }

    protected function assertPlannerOwner(Request $request, Planner $planner): void
    {
        $user = $request->user();
        if (!$user) abort(401);
        if ($user->role !== 'admin' && $planner->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }
    }

    /** Snapshot totals from planner (simple) */
    protected function snapshotTotals(Planner $planner): array
    {
        // Reuse relationships if not loaded
        $planner->loadMissing(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items']);

        $templateBase = (float) optional($planner->template)->base_price;
        $opt = 0.0;
        $opt += (float) optional($planner->size)->price_delta;
        $opt += (float) optional($planner->paper)->price_delta;
        $opt += (float) optional($planner->binding)->price_delta;
        $opt += (float) optional($planner->color)->price_delta;
        $opt += (float) optional($planner->cover)->price_delta;

        $itemsTotal = (float) $planner->items->sum(function ($it) {
            $unit = $it->unit_price_snapshot ?? (float) optional($it->component)->base_price;
            $qty  = $it->quantity ?? 1;
            return (float) $unit * (int) $qty;
        });

        $subtotal = $templateBase + $opt + $itemsTotal;

        // basic tax/shipping/discount placeholders (tweak as you wish or plug pricing service)
        $tax          = round($subtotal * 0.20, 2); // 20% VAT example
        $shipping_fee = $subtotal > 50 ? 0.00 : 4.90;
        $discount     = 0.00;
        $total        = max(0, $subtotal + $tax + $shipping_fee - $discount);

        return compact('subtotal', 'tax', 'shipping_fee', 'discount') + ['total' => $total];
    }

    protected function generateOrderNumber(): string
    {
        // e.g., ORD-20251013-ABC123
        return 'ORD-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6));
    }

    /** ===== READ ===== */

    // GET /api/orders
    public function index(Request $request)
    {
        $user = $request->user();

        $q = Order::query()
            ->with(['user:id,name,email', 'planner:id,title,user_id'])
            ->orderByDesc('id');

        if ($this->isAdmin($request)) {
            // Admin can filter optionally
            if ($request->filled('user_id')) {
                $q->where('user_id', (int) $request->query('user_id'));
            }
            if ($request->filled('status')) {
                $q->where('status', $request->query('status'));
            }
            if ($request->filled('payment_status')) {
                $q->where('payment_status', $request->query('payment_status'));
            }
        } else {
            $q->where('user_id', $user->id);
        }

        return OrderResource::collection($q->get());
    }

    // GET /api/orders/{id}
    public function show(Request $request, int $id)
    {
          $order = Order::with([
            'user:id,name,email',
            // Učitaj sve relacije planera za detaljan prikaz u modalu
            'planner',
            'planner.template',
            'planner.size',
            'planner.paper',
            'planner.binding',
            'planner.color',
            'planner.cover',
            'planner.items',
            'planner.items.component',
            'planner.items.component.category',
        ])->findOrFail($id);
        $this->assertOwnerOrAdmin($request, $order);
        
        return new OrderResource($order);
    }

    /** ===== WRITE ===== */

    // POST /api/orders  (customer creates from planner)
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) abort(401);
        if ($user->role !== 'customer') {
            abort(403, 'Only customers can place orders.');
        }

        $data = $request->validate([
            'planner_id'       => ['required', 'exists:planners,id'],
            'shipping_name'    => ['required', 'string', 'max:150'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'shipping_city'    => ['required', 'string', 'max:120'],
            'shipping_zip'     => ['required', 'string', 'max:30'],
            'shipping_country' => ['required', 'string', 'max:120'],
        ]);

        $planner = Planner::findOrFail($data['planner_id']);
        $this->assertPlannerOwner($request, $planner);

        // Prevent ordering locked/invalid planner if you want (optional)
        // if (...) abort(422, 'Planner not orderable');

        $totals = $this->snapshotTotals($planner);

        $order = Order::create([
            'user_id'      => $user->id,
            'planner_id'   => $planner->id,
            'order_number' => $this->generateOrderNumber(),

            'subtotal'       => $totals['subtotal'],
            'tax'            => $totals['tax'],
            'shipping_fee'   => $totals['shipping_fee'],
            'discount_total' => $totals['discount'],
            'total'          => $totals['total'],

            'status'         => 'pending',
            'payment_status' => 'unpaid',

            'shipping_name'    => $data['shipping_name'],
            'shipping_address' => $data['shipping_address'],
            'shipping_city'    => $data['shipping_city'],
            'shipping_zip'     => $data['shipping_zip'],
            'shipping_country' => $data['shipping_country'],

            'placed_at' => Carbon::now(),
        ]);

        return new OrderResource($order->load(['user:id,name,email', 'planner:id,title']));
    }

    // PUT /api/orders/{id} (update shipping)
    public function update(Request $request, int $id)
    {
        $order = Order::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $order);

        // Customers can only edit shipping while pending
        if (!$this->isAdmin($request)) {
            if ($order->status !== 'pending') {
                abort(422, 'You can update shipping only while order is pending.');
            }
        }

        $data = $request->validate([
            'shipping_name'    => ['sometimes', 'string', 'max:150'],
            'shipping_address' => ['sometimes', 'string', 'max:255'],
            'shipping_city'    => ['sometimes', 'string', 'max:120'],
            'shipping_zip'     => ['sometimes', 'string', 'max:30'],
            'shipping_country' => ['sometimes', 'string', 'max:120'],
        ]);

        $order->update($data);

        return new OrderResource($order->fresh()->load(['user:id,name,email', 'planner:id,title']));
    }

    // POST /api/orders/{id}/cancel (customer while pending; admin anytime)
    public function cancel(Request $request, int $id)
    {
        $order = Order::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $order);

        if ($this->isAdmin($request)) {
            // Admin can cancel unless already refunded
            if ($order->payment_status === 'refunded') {
                abort(422, 'Order is already refunded.');
            }
        } else {
            // Customer can cancel only while pending
            if ($order->status !== 'pending') {
                abort(422, 'Only pending orders can be canceled.');
            }
        }

        $order->status = 'canceled';
        $order->save();

        return new OrderResource($order);
    }

    /** ===== Admin transitions ===== */

    public function markPaid(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        if ($order->payment_status === 'paid') {
            return new OrderResource($order); // idempotent
        }

        if ($order->status === 'canceled') {
            abort(422, 'Cannot pay a canceled order.');
        }

        $order->payment_status = 'paid';
        // If still pending, push to in_production automatically
        if ($order->status === 'pending') {
            $order->status = 'in_production';
        }
        $order->save();

        return new OrderResource($order);
    }

    public function markRefunded(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        if ($order->payment_status !== 'paid') {
            abort(422, 'Only paid orders can be refunded.');
        }

        $order->payment_status = 'refunded';
        $order->status = 'refunded';
        $order->save();

        return new OrderResource($order);
    }

    public function markInProduction(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['pending', 'in_production'])) {
            abort(422, 'Order cannot be moved to production from current status.');
        }
        if ($order->status === 'pending' && $order->payment_status !== 'paid') {
            // You can relax this rule if you allow production before payment
            abort(422, 'Order must be paid before production.');
        }

        $order->status = 'in_production';
        $order->save();

        return new OrderResource($order);
    }

    public function markShipped(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['in_production', 'shipped'])) {
            abort(422, 'Order must be in production to be shipped.');
        }

        $order->status = 'shipped';
        $order->save();

        return new OrderResource($order);
    }

    public function markDelivered(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['shipped', 'delivered'])) {
            abort(422, 'Order must be shipped to be delivered.');
        }

        $order->status = 'delivered';
        $order->save();

        return new OrderResource($order);
    }
}
