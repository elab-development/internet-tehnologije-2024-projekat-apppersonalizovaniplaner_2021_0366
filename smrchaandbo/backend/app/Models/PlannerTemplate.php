<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlannerTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'base_price', 'is_active'];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}