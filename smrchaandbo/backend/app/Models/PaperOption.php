<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaperOption extends Model
{
    use HasFactory;

    protected $fillable = ['label', 'gsm', 'price_delta', 'is_active'];

    protected $casts = [
        'gsm' => 'integer',
        'price_delta' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}