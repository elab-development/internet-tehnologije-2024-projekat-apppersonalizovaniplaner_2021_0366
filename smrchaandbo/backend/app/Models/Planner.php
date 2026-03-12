<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

enum PlannerStatus: string
{
    case DRAFT = 'draft';
    case READY = 'ready';
    case ARCHIVED = 'archived';
}

class Planner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'custom_title_text',
        'size_option_id',
        'paper_option_id',
        'binding_option_id',
        'color_option_id',
        'cover_design_id',
        'template_id',
        'pages_estimate',
        'base_price',
        'options_total',
        'components_total',
        'final_price',
        'status',
    ];

    protected $casts = [
        'pages_estimate' => 'integer',
        'base_price' => 'decimal:2',
        'options_total' => 'decimal:2',
        'components_total' => 'decimal:2',
        'final_price' => 'decimal:2',
        'status' => PlannerStatus::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(SizeOption::class, 'size_option_id');
    }
    public function paper(): BelongsTo
    {
        return $this->belongsTo(PaperOption::class, 'paper_option_id');
    }
    public function binding(): BelongsTo
    {
        return $this->belongsTo(BindingOption::class, 'binding_option_id');
    }
    public function color(): BelongsTo
    {
        return $this->belongsTo(ColorOption::class, 'color_option_id');
    }
    public function cover(): BelongsTo
    {
        return $this->belongsTo(CoverDesign::class, 'cover_design_id');
    }
    public function template(): BelongsTo
    {
        return $this->belongsTo(PlannerTemplate::class, 'template_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PlannerComponentItem::class);
    }
}