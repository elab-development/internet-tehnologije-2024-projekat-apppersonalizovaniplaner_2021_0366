<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case IN_PRODUCTION = 'in_production';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELED = 'canceled';
    case REFUNDED = 'refunded';
}

enum PaymentStatus: string
{
    case UNPAID = 'unpaid';
    case PAID = 'paid';
    case REFUNDED = 'refunded';
}

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'planner_id',
        'order_number',
        'subtotal',
        'tax',
        'shipping_fee',
        'discount_total',
        'total',
        'status',
        'payment_status',
        'shipping_name',
        'shipping_address',
        'shipping_city',
        'shipping_zip',
        'shipping_country',
        'placed_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'total' => 'decimal:2',
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'placed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function planner(): BelongsTo
    {
        return $this->belongsTo(Planner::class);
    }
}