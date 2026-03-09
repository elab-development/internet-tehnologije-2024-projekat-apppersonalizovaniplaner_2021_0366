<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaperOptionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'label'       => $this->label,
            'gsm'         => (int) $this->gsm,
            'price_delta' => (float) $this->price_delta,
            'is_active'   => (bool) $this->is_active,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
