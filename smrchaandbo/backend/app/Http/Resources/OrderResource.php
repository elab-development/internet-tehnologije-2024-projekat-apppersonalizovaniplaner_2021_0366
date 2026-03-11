<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'             => $this->id,
            'order_number'   => $this->order_number,
            'status'         => $this->status,
            'payment_status' => $this->payment_status,

            'subtotal'       => (float) $this->subtotal,
            'tax'            => (float) $this->tax,
            'shipping_fee'   => (float) $this->shipping_fee,
            'discount_total' => (float) $this->discount_total,
            'total'          => (float) $this->total,

            'shipping' => [
                'name'    => $this->shipping_name,
                'address' => $this->shipping_address,
                'city'    => $this->shipping_city,
                'zip'     => $this->shipping_zip,
                'country' => $this->shipping_country,
            ],

            'placed_at'      => $this->placed_at,
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,

            'user' => $this->whenLoaded('user', fn() => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
 // Prošireni planner samo kada je učitan (u show)
            'planner' => $this->whenLoaded('planner', function () {
                $p = $this->planner;

                return [
                    'id'    => $p->id,
                    'title' => $p->title,

                    'template' => $p->relationLoaded('template') && $p->template ? [
                        'id'   => $p->template->id,
                        'name' => $p->template->name,
                        'base_price' => (float) $p->template->base_price,
                    ] : null,

                    'size' => $p->relationLoaded('size') && $p->size ? [
                        'id'    => $p->size->id,
                        'label' => $p->size->label,
                        'price_delta' => (float) $p->size->price_delta,
                    ] : null,

                    'paper' => $p->relationLoaded('paper') && $p->paper ? [
                        'id'    => $p->paper->id,
                        'label' => $p->paper->label,
                        'price_delta' => (float) $p->paper->price_delta,
                    ] : null,

                    'binding' => $p->relationLoaded('binding') && $p->binding ? [
                        'id'    => $p->binding->id,
                        'label' => $p->binding->label,
                        'price_delta' => (float) $p->binding->price_delta,
                    ] : null,

                    'color' => $p->relationLoaded('color') && $p->color ? [
                        'id'    => $p->color->id,
                        'name'  => $p->color->name,
                        'hex'   => $p->color->hex,
                        'price_delta' => (float) $p->color->price_delta,
                    ] : null,

                    'cover' => $p->relationLoaded('cover') && $p->cover ? [
                        'id'    => $p->cover->id,
                        'name'  => $p->cover->name,
                        'image_url' => $p->cover->image_url,
                        'price_delta' => (float) $p->cover->price_delta,
                    ] : null,

                    // Stavke sa komponentama
                    'items' => $p->relationLoaded('items') ? $p->items->map(function ($it) {
                        return [
                            'id'                   => $it->id,
                            'quantity'             => (int) ($it->quantity ?? 1),
                            'pages'                => $it->pages ? (int) $it->pages : null,
                            'sort_order'           => (int) ($it->sort_order ?? 0),
                            'unit_price_snapshot'  => (float) ($it->unit_price_snapshot ?? 0),
                            'line_total_snapshot'  => (float) ($it->line_total_snapshot ?? 0),
                            'component'            => $it->relationLoaded('component') && $it->component ? [
                                'id'          => $it->component->id,
                                'title'       => $it->component->title,
                                'base_price'  => (float) $it->component->base_price,
                                'category'    => $it->component->relationLoaded('category') && $it->component->category ? [
                                    'id'   => $it->component->category->id,
                                    'name' => $it->component->category->name,
                                ] : null,
                            ] : null,
                        ];
                    }) : [],
                ];
            }),
           
        ];
    }
}
