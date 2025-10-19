<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class PlannerComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'base_price',
        'default_pages',
        'max_repeats',
        'category_id',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'default_pages' => 'integer',
        'max_repeats' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(PlannerComponentCategory::class, 'category_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PlannerComponentItem::class);
    }
}