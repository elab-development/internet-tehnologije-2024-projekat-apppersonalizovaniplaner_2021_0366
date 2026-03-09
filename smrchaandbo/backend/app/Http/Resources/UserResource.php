<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'    => $this->id,
            'name'  => $this->name,
            'email' => $this->email,
            'role'  => $this->role?->value,

            'created_at' => optional($this->created_at)?->toISOString(),
            'updated_at' => optional($this->updated_at)?->toISOString(),

            'planners' => PlannerResource::collection($this->whenLoaded('planners')),
            'orders'   => OrderResource::collection($this->whenLoaded('orders')),
        ];
    }
}
