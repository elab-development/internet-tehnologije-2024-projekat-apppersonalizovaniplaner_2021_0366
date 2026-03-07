<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BindingOption extends Model
{
    use HasFactory;

    protected $fillable = ['label', 'price_delta', 'is_active'];

    protected $casts = [
        'price_delta' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}