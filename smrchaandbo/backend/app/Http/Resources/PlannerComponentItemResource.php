<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlannerComponentItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'planner_id' => $this->planner_id,
            'component'  => $this->whenLoaded('component', function () {
                return [
                    'id'          => $this->component->id,
                    'title'       => $this->component->title,
                    'slug'        => $this->component->slug,
                    'base_price'  => (float) $this->component->base_price,
                    'category'    => $this->component->relationLoaded('category') && $this->component->category
                        ? ['id' => $this->component->category->id, 'name' => $this->component->category->name]
                        : null,
                ];
            }),
            'quantity'   => (int) $this->quantity,
            'pages'      => $this->pages ? (int) $this->pages : null,
            'sort_order' => (int) $this->sort_order,
            'config_json' => $this->config_json,
            'unit_price_snapshot' => (float) $this->unit_price_snapshot,
            'line_total_snapshot' => (float) $this->line_total_snapshot,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
