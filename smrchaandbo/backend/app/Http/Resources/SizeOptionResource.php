<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SizeOptionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'label'       => $this->label,
            'price_delta' => (float) $this->price_delta,
            'is_active'   => (bool) $this->is_active,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
