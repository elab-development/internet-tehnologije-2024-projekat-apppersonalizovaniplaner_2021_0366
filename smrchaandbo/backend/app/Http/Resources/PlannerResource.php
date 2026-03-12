<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlannerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'user'      => $this->whenLoaded('user', function () {
                return [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'title'     => $this->title,
            'notes'     => $this->notes,

            'template'  => $this->whenLoaded('template', fn() => [
                'id' => $this->template->id,
                'name' => $this->template->name,
                'base_price' => (float) $this->template->base_price,
            ]),
            'size'      => $this->whenLoaded('size', fn() => [
                'id' => $this->size->id,
                'label' => $this->size->label,
                'price_delta' => (float) $this->size->price_delta,
            ]),
            'paper'     => $this->whenLoaded('paper', fn() => [
                'id' => $this->paper->id,
                'label' => $this->paper->label,
                'gsm' => (int) $this->paper->gsm,
                'price_delta' => (float) $this->paper->price_delta,
            ]),
            'binding'   => $this->whenLoaded('binding', fn() => [
                'id' => $this->binding->id,
                'label' => $this->binding->label,
                'price_delta' => (float) $this->binding->price_delta,
            ]),
            'color'     => $this->whenLoaded('color', fn() => [
                'id' => $this->color->id,
                'name' => $this->color->name,
                'hex' => $this->color->hex,
                'price_delta' => (float) $this->color->price_delta,
            ]),
            'cover'     => $this->whenLoaded('cover', fn() => [
                'id' => $this->cover->id,
                'name' => $this->cover->name,
                'image_url' => $this->cover->image_url,
                'price_delta' => (float) $this->cover->price_delta,
            ]),

            'items_count'    => $this->items_count ?? $this->whenLoaded('items', fn() => $this->items->count()),
            'computed_totals' => $this->computed_totals ?? null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
