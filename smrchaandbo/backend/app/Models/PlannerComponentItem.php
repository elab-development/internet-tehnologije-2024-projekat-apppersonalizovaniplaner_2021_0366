<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlannerComponentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'planner_id',
        'planner_component_id',
        'quantity',
        'pages',
        'sort_order',
        'config_json',
        'unit_price_snapshot',
        'line_total_snapshot',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'pages' => 'integer',
        'sort_order' => 'integer',
        'config_json' => 'array',
        'unit_price_snapshot' => 'decimal:2',
        'line_total_snapshot' => 'decimal:2',
    ];

    public function planner(): BelongsTo
    {
        return $this->belongsTo(Planner::class);
    }
    public function component(): BelongsTo
    {
        return $this->belongsTo(PlannerComponent::class, 'planner_component_id');
    }
}