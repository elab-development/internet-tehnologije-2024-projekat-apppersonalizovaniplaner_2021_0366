<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Models
use App\Models\{
    SizeOption,
    PaperOption,
    BindingOption,
    ColorOption,
    CoverDesign,
    PlannerTemplate,
    PlannerComponentCategory,
    PlannerComponent
};

// Resources
use App\Http\Resources\{
    SizeOptionResource,
    PaperOptionResource,
    BindingOptionResource,
    ColorOptionResource,
    CoverDesignResource,
    PlannerTemplateResource,
    PlannerComponentCategoryResource,
    PlannerComponentResource
};

use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    /** ========= READ (public) ========= */

    public function sizesIndex(Request $request)
    {
        $q = SizeOption::query();
        if ($request->boolean('active_only', true)) $q->where('is_active', true);
        return SizeOptionResource::collection($q->orderBy('label')->get());
    }

    public function papersIndex(Request $request)
    {
        $q = PaperOption::query();
        if ($request->boolean('active_only', true)) $q->where('is_active', true);
        return PaperOptionResource::collection($q->orderBy('gsm')->get());
    }

    public function bindingsIndex(Request $request)
    {
        $q = BindingOption::query();
        if ($request->boolean('active_only', true)) $q->where('is_active', true);
        return BindingOptionResource::collection($q->orderBy('label')->get());
    }

    public function colorsIndex(Request $request)
    {
        $q = ColorOption::query();
        if ($request->boolean('active_only', true)) $q->where('is_active', true);
        return ColorOptionResource::collection($q->orderBy('name')->get());
    }

    public function coversIndex(Request $request)
    {
        $q = CoverDesign::query();
        if ($request->boolean('active_only', true)) $q->where('is_active', true);
        return CoverDesignResource::collection($q->orderBy('name')->get());
    }

    public function templatesIndex(Request $request)
    {
        $q = PlannerTemplate::query();
        if ($request->boolean('active_only', true)) $q->where('is_active', true);
        return PlannerTemplateResource::collection($q->orderBy('name')->get());
    }

    public function componentCategoriesIndex(Request $request)
    {
        $q = PlannerComponentCategory::query();
        return PlannerComponentCategoryResource::collection($q->orderBy('name')->get());
    }

    public function componentsIndex(Request $request)
    {
        $q = PlannerComponent::query()->with('category');

        if ($request->filled('category_id')) $q->where('category_id', $request->integer('category_id'));
        if ($request->boolean('active_only', true)) $q->where('is_active', true);

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($qq) use ($search) {
                $qq->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return PlannerComponentResource::collection($q->orderBy('title')->get());
    }

    /** ========= WRITE (admin) ========= */

    // --- Sizes ---
    public function sizesStore(Request $request)
    {
        $data = $request->validate([
            'code'        => ['required', 'string', 'max:20', 'unique:size_options,code'],
            'label'       => ['required', 'string', 'max:100'],
            'price_delta' => ['required', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);

        $m = SizeOption::create($data);
        return new SizeOptionResource($m);
    }

    public function sizesUpdate(Request $request, int $id)
    {
        $m = SizeOption::findOrFail($id);
        $data = $request->validate([
            'code'        => ['sometimes', 'string', 'max:20', Rule::unique('size_options', 'code')->ignore($m->id)],
            'label'       => ['sometimes', 'string', 'max:100'],
            'price_delta' => ['sometimes', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
        $m->update($data);
        return new SizeOptionResource($m);
    }

    public function sizesDestroy(int $id)
    {
        SizeOption::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Papers ---
    public function papersStore(Request $request)
    {
        $data = $request->validate([
            'label'       => ['required', 'string', 'max:100', 'unique:paper_options,label'],
            'gsm'         => ['required', 'integer', 'min:60', 'max:200'],
            'price_delta' => ['required', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
        $m = PaperOption::create($data);
        return new PaperOptionResource($m);
    }

    public function papersUpdate(Request $request, int $id)
    {
        $m = PaperOption::findOrFail($id);
        $data = $request->validate([
            'label'       => ['sometimes', 'string', 'max:100', Rule::unique('paper_options', 'label')->ignore($m->id)],
            'gsm'         => ['sometimes', 'integer', 'min:60', 'max:200'],
            'price_delta' => ['sometimes', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
        $m->update($data);
        return new PaperOptionResource($m);
    }

    public function papersDestroy(int $id)
    {
        PaperOption::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Bindings ---
    public function bindingsStore(Request $request)
    {
        $data = $request->validate([
            'label'       => ['required', 'string', 'max:100', 'unique:binding_options,label'],
            'price_delta' => ['required', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
        $m = BindingOption::create($data);
        return new BindingOptionResource($m);
    }

    public function bindingsUpdate(Request $request, int $id)
    {
        $m = BindingOption::findOrFail($id);
        $data = $request->validate([
            'label'       => ['sometimes', 'string', 'max:100', Rule::unique('binding_options', 'label')->ignore($m->id)],
            'price_delta' => ['sometimes', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
        $m->update($data);
        return new BindingOptionResource($m);
    }

    public function bindingsDestroy(int $id)
    {
        BindingOption::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Colors ---
    public function colorsStore(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:color_options,name'],
            'hex'         => ['required', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'price_delta' => ['required', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
        // normalize hex with leading '#'
        $data['hex'] = Str::startsWith($data['hex'], '#') ? $data['hex'] : ('#' . $data['hex']);

        $m = ColorOption::create($data);
        return new ColorOptionResource($m);
    }

    public function colorsUpdate(Request $request, int $id)
    {
        $m = ColorOption::findOrFail($id);
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100', Rule::unique('color_options', 'name')->ignore($m->id)],
            'hex'         => ['sometimes', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'price_delta' => ['sometimes', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
        if (isset($data['hex'])) {
            $data['hex'] = Str::startsWith($data['hex'], '#') ? $data['hex'] : ('#' . $data['hex']);
        }
        $m->update($data);
        return new ColorOptionResource($m);
    }

    public function colorsDestroy(int $id)
    {
        ColorOption::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Covers ---
    public function coversStore(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:150', 'unique:cover_designs,name'],
            'image_url'   => ['required', 'string', 'max:255'],
            'price_delta' => ['required', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
        $m = CoverDesign::create($data);
        return new CoverDesignResource($m);
    }

    public function coversUpdate(Request $request, int $id)
    {
        $m = CoverDesign::findOrFail($id);
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:150', Rule::unique('cover_designs', 'name')->ignore($m->id)],
            'image_url'   => ['sometimes', 'string', 'max:255'],
            'price_delta' => ['sometimes', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
        $m->update($data);
        return new CoverDesignResource($m);
    }

    public function coversDestroy(int $id)
    {
        CoverDesign::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Templates ---
    public function templatesStore(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:150', 'unique:planner_templates,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'base_price'  => ['required', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
        $m = PlannerTemplate::create($data);
        return new PlannerTemplateResource($m);
    }

    public function templatesUpdate(Request $request, int $id)
    {
        $m = PlannerTemplate::findOrFail($id);
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:150', Rule::unique('planner_templates', 'name')->ignore($m->id)],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'base_price'  => ['sometimes', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
        $m->update($data);
        return new PlannerTemplateResource($m);
    }

    public function templatesDestroy(int $id)
    {
        PlannerTemplate::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Component Categories ---
    public function componentCategoriesStore(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150', 'unique:planner_component_categories,slug'],
        ]);
        if (empty($data['slug'])) $data['slug'] = Str::slug($data['name']);
        $m = PlannerComponentCategory::create($data);
        return new PlannerComponentCategoryResource($m);
    }

    public function componentCategoriesUpdate(Request $request, int $id)
    {
        $m = PlannerComponentCategory::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'slug' => ['sometimes', 'string', 'max:150', Rule::unique('planner_component_categories', 'slug')->ignore($m->id)],
        ]);
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $m->update($data);
        return new PlannerComponentCategoryResource($m);
    }

    public function componentCategoriesDestroy(int $id)
    {
        PlannerComponentCategory::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }

    // --- Components ---
    public function componentsStore(Request $request)
    {
        $data = $request->validate([
            'title'         => ['required', 'string', 'max:150'],
            'slug'          => ['nullable', 'string', 'max:150', 'unique:planner_components,slug'],
            'description'   => ['nullable', 'string'],
            'base_price'    => ['required', 'numeric', 'min:0'],
            'default_pages' => ['nullable', 'integer', 'min:1', 'max:500'],
            'max_repeats'   => ['nullable', 'integer', 'min:1', 'max:1000'],
            'category_id'   => ['nullable', 'exists:planner_component_categories,id'],
            'is_active'     => ['boolean'],
        ]);
        if (empty($data['slug'])) $data['slug'] = Str::slug($data['title']);
        $m = PlannerComponent::create($data);
        return new PlannerComponentResource($m->load('category'));
    }

    public function componentsUpdate(Request $request, int $id)
    {
        $m = PlannerComponent::findOrFail($id);
        $data = $request->validate([
            'title'         => ['sometimes', 'string', 'max:150'],
            'slug'          => ['sometimes', 'string', 'max:150', Rule::unique('planner_components', 'slug')->ignore($m->id)],
            'description'   => ['sometimes', 'nullable', 'string'],
            'base_price'    => ['sometimes', 'numeric', 'min:0'],
            'default_pages' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:500'],
            'max_repeats'   => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1000'],
            'category_id'   => ['sometimes', 'nullable', 'exists:planner_component_categories,id'],
            'is_active'     => ['sometimes', 'boolean'],
        ]);
        if (isset($data['title']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        $m->update($data);
        return new PlannerComponentResource($m->load('category'));
    }

    public function componentsDestroy(int $id)
    {
        PlannerComponent::findOrFail($id)->delete();
        return response()->json(['deleted' => true]);
    }
}
