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
        return $request->user()?->role === UserRole::ADMIN;
    }

    protected function assertOwnerOrAdmin(Request $request, Planner $planner): void
    {
        $user = $request->user();
          if (!$user) abort(401, 'Unauthenticated.');
        if ($user->role !== UserRole::ADMIN && $planner->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }
    }

    protected function isLocked(Planner $planner): bool
    {
        return Order::where('planner_id', $planner->id)->exists();
    }
     /** Sirov proračun totals-a (bez upisa u DB) */
    protected function calculateTotals(Planner $planner): array
    {
        $templateBase = (float) optional($planner->template)->base_price;
        $sizeDelta    = (float) optional($planner->size)->price_delta;
        $paperDelta   = (float) optional($planner->paper)->price_delta;
        $bindingDelta = (float) optional($planner->binding)->price_delta;
        $colorDelta   = (float) optional($planner->color)->price_delta;
        $coverDelta   = (float) optional($planner->cover)->price_delta;

         $componentsTotal = $planner->items->sum(function ($it) {
            $unit = $it->unit_price_snapshot ?? (float) optional($it->component)->base_price;
            $qty  = $it->quantity ?? 1;
            return (float) $unit * (int) $qty;
        });

        $optionsTotal = $sizeDelta + $paperDelta + $bindingDelta + $colorDelta + $coverDelta;
        $final = $templateBase + $optionsTotal + $componentsTotal;

        // pages estimate: sum (item.pages ?? component.default_pages) * quantity
        $pagesEstimate = $planner->items->sum(function ($it) {
            $pages = $it->pages ?? optional($it->component)->default_pages ?? 0;
            $qty   = $it->quantity ?? 1;
            return (int) $pages * (int) $qty;
        });

        return [
              'base_price'       => (float) $templateBase,
            'options_total'    => (float) $optionsTotal,
            'components_total' => (float) $componentsTotal,
            'final_price'      => (float) $final,
            'pages_estimate'   => (int) $pagesEstimate,
        ];
    }
    /** Izračunaj i upiši totals polja + eventualno pages_estimate kad nije zadat */
    protected function recalcAndPersist(Planner $planner, ?int $overridePages = null): Planner
    {
        $planner->load(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component']);

        $totals = $this->calculateTotals($planner);

        $update = [
            'base_price'       => $totals['base_price'],
            'options_total'    => $totals['options_total'],
            'components_total' => $totals['components_total'],
            'final_price'      => $totals['final_price'],
        ];

        // ako nije eksplicitno prosleđen pages_estimate, koristimo izračunat
        $update['pages_estimate'] = $overridePages ?? $totals['pages_estimate'];

        $planner->fill($update)->save();

        // attach computed_totals za response
        $planner->computed_totals = [
            'template_base' => (float) $totals['base_price'],
            'options_delta' => (float) $totals['options_total'],
            'items_total'   => (float) $totals['components_total'],
            'subtotal'      => (float) $totals['final_price'],
        ];

        return $planner;
    }

    /** ===================== READ ===================== */

    public function index(Request $request)
    {
        $user = $request->user();
        $q = Planner::query()
             ->with(['user:id,name,email,role', 'template', 'size', 'paper', 'binding', 'color', 'cover'])
            ->withCount('items');

        if ($this->isAdmin($request)) {
            
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
        
        $planners->load('items.component');

          // priloži computed_totals za UI (nije obavezno, ali zgodno)
        $planners->each(function ($p) {
             $totals = $this->calculateTotals($p);
            $p->computed_totals = [
                'template_base' => (float) $totals['base_price'],
                'options_delta' => (float) $totals['options_total'],
                'items_total'   => (float) $totals['components_total'],
                'subtotal'      => (float) $totals['final_price'],
            ];
        });

        return PlannerResource::collection($planners);
    }

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

         // osveži computed_totals (kolone već postoje u bazi)
        $totals = $this->calculateTotals($planner);
        $planner->computed_totals = [
            'template_base' => (float) $totals['base_price'],
            'options_delta' => (float) $totals['options_total'],
            'items_total'   => (float) $totals['components_total'],
            'subtotal'      => (float) $totals['final_price'],
        ];

        return new PlannerResource($planner);
    }

    /** ===================== WRITE ===================== */

       // POST /api/planners
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== UserRole::CUSTOMER) {
            return response()->json(['message' => 'Only customers can create planners.'], 403);
        }

        $data = $request->validate([
            'title'              => ['nullable', 'string', 'max:150'],
            'custom_title_text'  => ['nullable', 'string', 'max:150'],
            'template_id'        => ['required', 'exists:planner_templates,id'],
            'size_option_id'     => ['required', 'exists:size_options,id'],
            'paper_option_id'    => ['required', 'exists:paper_options,id'],
            'binding_option_id'  => ['required', 'exists:binding_options,id'],
            'color_option_id'    => ['nullable', 'exists:color_options,id'],
            'cover_design_id'    => ['nullable', 'exists:cover_designs,id'],
            'pages_estimate'     => ['nullable', 'integer', 'min:1'],
        ]);

        $planner = Planner::create([
            'user_id'           => $user->id,
            'title'             => $data['title'] ?? null,
            'custom_title_text' => $data['custom_title_text'] ?? null,
            'template_id'       => $data['template_id'],
            'size_option_id'    => $data['size_option_id'],
            'paper_option_id'   => $data['paper_option_id'],
            'binding_option_id' => $data['binding_option_id'],
            'color_option_id'   => $data['color_option_id'] ?? null,
            'cover_design_id'   => $data['cover_design_id'] ?? null,
        ]);

         // izračunaj i upiši totals (poštuj ručno prosleđen pages_estimate ako ga ima)
        $overridePages = $data['pages_estimate'] ?? null;
        $planner = $this->recalcAndPersist($planner, $overridePages);

         return new PlannerResource($planner->load(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component']));
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
            'title'              => ['sometimes', 'nullable', 'string', 'max:150'],
            'custom_title_text'  => ['sometimes', 'nullable', 'string', 'max:150'],
            'template_id'        => ['sometimes', 'exists:planner_templates,id'],
            'size_option_id'     => ['sometimes', 'exists:size_options,id'],
            'paper_option_id'    => ['sometimes', 'exists:paper_options,id'],
            'binding_option_id'  => ['sometimes', 'exists:binding_options,id'],
            'color_option_id'    => ['sometimes', 'nullable', 'exists:color_options,id'],
            'cover_design_id'    => ['sometimes', 'nullable', 'exists:cover_designs,id'],
            'pages_estimate'     => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $planner->update($data);

         // ponovo izračunaj i upiši totals; ako je pages_estimate poslat, koristi njega
        $overridePages = array_key_exists('pages_estimate', $data) ? $data['pages_estimate'] : null;
        $planner = $this->recalcAndPersist($planner, $overridePages);

        return new PlannerResource($planner->load(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component']));
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

    public function itemsIndex(Request $request, int $id)
    {
        $planner = Planner::findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        $items = $planner->items()->with('component.category')->orderBy('sort_order')->get();
        return PlannerComponentItemResource::collection($items);
    }

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
             'config_json'  => ['nullable', 'array'],
        ]);

        $component = PlannerComponent::findOrFail($data['component_id']);

        $item = new PlannerComponentItem();
        $item->planner_id           = $planner->id;
        $item->planner_component_id = $component->id;
        $item->quantity             = $data['quantity'] ?? 1;
        $item->pages                = $data['pages'] ?? null;
        $item->sort_order           = $data['sort_order'] ?? 0;
        $item->config_json          = $data['config_json'] ?? null;

        $item->unit_price_snapshot  = (float) $component->base_price;
        $item->line_total_snapshot  = (float) $item->unit_price_snapshot * (int) $item->quantity;

        $item->save();

         // nakon izmene item-a, recalculiši i upiši totals
        $this->recalcAndPersist($planner->fresh());

        return new PlannerComponentItemResource($item->load('component.category'));
    }

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

          // osveži snapshot
        $unit = $item->unit_price_snapshot ?: (float) optional($item->component)->base_price;
        $qty  = $item->quantity ?? 1;
        $item->line_total_snapshot = (float) $unit * (int) $qty;
        $item->save();

          // nakon izmene item-a, recalculiši i upiši totals
        $this->recalcAndPersist($planner->fresh());

        return new PlannerComponentItemResource($item->load('component.category'));
    }

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

         // nakon izmene item-a, recalculiši i upiši totals
        $this->recalcAndPersist($planner->fresh());

        return response()->json(['deleted' => true]);
    }

    public function recalculate(Request $request, int $id)
    {
        $planner = Planner::with(['template', 'size', 'paper', 'binding', 'color', 'cover', 'items.component'])
            ->findOrFail($id);
        $this->assertOwnerOrAdmin($request, $planner);

        // recalculiši i upiši totals; vrati i computed_totals
        $planner = $this->recalcAndPersist($planner);

        return response()->json([
            'totals' => [
                'base_price'       => (float) $planner->base_price,
                'options_total'    => (float) $planner->options_total,
                'components_total' => (float) $planner->components_total,
                'final_price'      => (float) $planner->final_price,
                'pages_estimate'   => (int) $planner->pages_estimate,
            ],
        ]);
    }
}
