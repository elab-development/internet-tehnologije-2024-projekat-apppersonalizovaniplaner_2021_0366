<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{
    Planner,
    PlannerComponentItem,
    PlannerComponent,
    Order,
    UserRole
};
use App\Http\Resources\{
    PlannerResource,
    PlannerComponentItemResource
};

class PlannerController extends Controller
{
    /** ===================== Helpers ===================== */
    protected function isAdmin(Request $request): bool
    {
        // $request->user()->role je enum UserRole
        return $request->user()?->role === UserRole::ADMIN;
    }

    protected function assertOwnerOrAdmin(Request $request, Planner $planner): void
    {
        $user = $request->user();
         if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($user->role !== UserRole::ADMIN && $planner->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }
    }

    protected function isLocked(Planner $planner): bool
    {
        // Lock if already used by an order
        return Order::where('planner_id', $planner->id)->exists();
    }

    /** Recalculate totals (no DB writes here—items snapshots updated when items change) */
    protected function calculateTotals(Planner $planner): array
    {
        $templateBase = (float) optional($planner->template)->base_price;
        $sizeDelta    = (float) optional($planner->size)->price_delta;
        $paperDelta   = (float) optional($planner->paper)->price_delta;
        $bindingDelta = (float) optional($planner->binding)->price_delta;
        $colorDelta   = (float) optional($planner->color)->price_delta;
        $coverDelta   = (float) optional($planner->cover)->price_delta;

        $itemsTotal = $planner->items->sum(function ($it) {
            // fallbacks if snapshots missing
            $unit = $it->unit_price_snapshot ?? (float) optional($it->component)->base_price;
            $qty  = $it->quantity ?? 1;
            return (float) $unit * (int) $qty;
        });

        $subtotal = $templateBase + $sizeDelta + $paperDelta + $bindingDelta + $colorDelta + $coverDelta + $itemsTotal;

        return [
            'template_base' => $templateBase,
            'options_delta' => $sizeDelta + $paperDelta + $bindingDelta + $colorDelta + $coverDelta,
            'items_total'   => (float) $itemsTotal,
            'subtotal'      => (float) $subtotal,
        ];
    }

    /** ===================== READ ===================== */

    // GET /api/planners
    public function index(Request $request)
    {
        $user = $request->user();
        $q = Planner::query()
             ->with(['user:id,name,email,role', 'template', 'size', 'paper', 'binding', 'color', 'cover'])
            ->withCount('items');

        if ($this->isAdmin($request)) {
            // Optional filters for admin
            if ($request->filled('user_id')) {
                $q->where('user_id', (int) $request->query('user_id'));
            }
            if ($request->filled('template_id')) {
                $q->where('template_id', (int) $request->query('template_id'));
            }
        } else {
            $q->where('user_id', $user->id);
        }

        $planners = $q->orderByDesc('id')->get();
        // attach computed totals for convenience
        $planners->load('items.component');
        $planners->each(function ($p) {
            $p->computed_totals = $this->calculateTotals($p);
        });

        return PlannerResource::collection($planners);
    }

    // GET /api/planners/{id}
    public function show(Request $request, int $id)
    {
        $planner = Planner::with([
            'user:id,name,email,role',
            'template',
            'size',
            'paper',
            'binding',
            'color',
            'cover',
            'items.component',
            'items.component.category'
        ])->findOrFail($id);

        $this->assertOwnerOrAdmin($request, $planner);

        $planner->computed_totals = $this->calculateTotals($planner);

        return new PlannerResource($planner);
    }

    /** ===================== WRITE ===================== */

     // POST /api/planners  (customers only — ali proveravamo i ovde eksplicitno)
    public function store(Request $request)
    {
        $user = $request->user();
         // DODATNA PROVERA: nemoj oslanjati se samo na middleware
        if ($user->role !== UserRole::CUSTOMER) {
            return response()->json(['message' => 'Only customers can create planners.'], 403);
        }

        $data = $request->validate([
            'title'         => ['nullable', 'string', 'max:150'],
            'template_id'   => ['required', 'exists:planner_templates,id'],
            'size_id'       => ['required', 'exists:size_options,id'],
            'paper_id'      => ['required', 'exists:paper_options,id'],
            'binding_id'    => ['required', 'exists:binding_options,id'],
            'color_id'      => ['nullable', 'exists:color_options,id'],
            'cover_id'      => ['nullable', 'exists:cover_designs,id'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]);

        $planner = Planner::create([
            'user_id'     => $user->id,
            'title'       => $data['title'] ?? null,
            'template_id' => $data['template_id'],
            'size_id'     => $data['size_id'],
            'paper_id'    => $data['paper_id'],
            'binding_id'  => $data['binding_id'],
            'color_id'    => $data['color_id'] ?? null,
            'cover_id'    => $data['cover_id'] ?? null,
            'notes'       => $data['notes'] ?? null,
        ]);

        $planner->load(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component']);
        $planner->computed_totals = $this->calculateTotals($planner);

        return new PlannerResource($planner);
    }

    // PUT /api/planners/{id}
    public function update(Request $request, int $id)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        if ($this->isLocked($planner)) {
             return response()->json(['message' => 'Planner is locked (already used by an order).'], 422);
        }

        $data = $request->validate([
            'title'         => ['sometimes', 'nullable', 'string', 'max:150'],
            'template_id'   => ['sometimes', 'exists:planner_templates,id'],
            'size_id'       => ['sometimes', 'exists:size_options,id'],
            'paper_id'      => ['sometimes', 'exists:paper_options,id'],
            'binding_id'    => ['sometimes', 'exists:binding_options,id'],
            'color_id'      => ['sometimes', 'nullable', 'exists:color_options,id'],
            'cover_id'      => ['sometimes', 'nullable', 'exists:cover_designs,id'],
            'notes'         => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $planner->update($data);

        $planner->load(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component']);
        $planner->computed_totals = $this->calculateTotals($planner);

        return new PlannerResource($planner);
    }

    // DELETE /api/planners/{id}
    public function destroy(Request $request, int $id)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        if ($this->isLocked($planner)) {
             return response()->json(['message' => 'Planner is locked (already used by an order).'], 422);
        }

        $planner->delete();

        return response()->json(['deleted' => true]);
    }

    /** ===================== ITEMS ===================== */

    // GET /api/planners/{id}/items
    public function itemsIndex(Request $request, int $id)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        $items = $planner->items()->with('component.category')->orderBy('sort_order')->get();
        return PlannerComponentItemResource::collection($items);
    }

    // POST /api/planners/{id}/items
    public function itemsStore(Request $request, int $id)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        if ($this->isLocked($planner)) {
             return response()->json(['message' => 'Planner is locked (already used by an order).'], 422);
        }

        $data = $request->validate([
            'component_id' => ['required', 'exists:planner_components,id'],
            'quantity'     => ['nullable', 'integer', 'min:1'],
            'pages'        => ['nullable', 'integer', 'min:1', 'max:1000'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
            'config_json'  => ['nullable', 'array'], // accepts JSON object
        ]);

        $component = PlannerComponent::findOrFail($data['component_id']);

        $item = new PlannerComponentItem();
        $item->planner_id           = $planner->id;
        $item->planner_component_id = $component->id;
        $item->quantity             = $data['quantity'] ?? 1;
        $item->pages                = $data['pages'] ?? null;
        $item->sort_order           = $data['sort_order'] ?? 0;
        $item->config_json          = $data['config_json'] ?? null;

        // price snapshots
        $item->unit_price_snapshot  = (float) $component->base_price;
        $item->line_total_snapshot  = (float) $item->unit_price_snapshot * (int) $item->quantity;

        $item->save();

        return new PlannerComponentItemResource($item->load('component.category'));
    }

    // PUT /api/planners/{id}/items/{itemId}
    public function itemsUpdate(Request $request, int $id, int $itemId)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        if ($this->isLocked($planner)) {
             return response()->json(['message' => 'Planner is locked (already used by an order).'], 422);
        }

         $item = PlannerComponentItem::where('planner_id', $planner->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $data = $request->validate([
            'quantity'     => ['sometimes', 'integer', 'min:1'],
            'pages'        => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1000'],
            'sort_order'   => ['sometimes', 'integer', 'min:0'],
            'config_json'  => ['sometimes', 'nullable', 'array'],
        ]);

        $item->update($data);

        // refresh price snapshot if quantity changed
        $unit = $item->unit_price_snapshot ?: (float) optional($item->component)->base_price;
        $qty  = $item->quantity ?? 1;
        $item->line_total_snapshot = (float) $unit * (int) $qty;
        $item->save();

        return new PlannerComponentItemResource($item->load('component.category'));
    }

    // DELETE /api/planners/{id}/items/{itemId}
    public function itemsDestroy(Request $request, int $id, int $itemId)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        if ($this->isLocked($planner)) {
             return response()->json(['message' => 'Planner is locked (already used by an order).'], 422);
        }

        $item = PlannerComponentItem::where('planner_id', $planner->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $item->delete();

        return response()->json(['deleted' => true]);
    }

    // POST /api/planners/{id}/recalculate
    public function recalculate(Request $request, int $id)
    {
        $planner = Planner::with(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component'])
            ->findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        $totals = $this->calculateTotals($planner);

        return response()->json(['totals' => $totals]);
    }
}
