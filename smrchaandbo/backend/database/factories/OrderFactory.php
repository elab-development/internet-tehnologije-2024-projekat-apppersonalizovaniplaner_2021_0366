<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\PaymentStatus;
use App\Models\User;
use App\Models\Planner;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 10, 60);
        $tax = round($subtotal * 0.1, 2);
        $shipping = $this->faker->randomFloat(2, 0, 7);
        $discount = $this->faker->randomFloat(2, 0, 5);
        $total = max(0, $subtotal + $tax + $shipping - $discount);

        return [
            'user_id' => $this->faker->boolean(80) ? User::factory() : null,
            'planner_id' => Planner::factory(),
            'order_number' => 'SBO-' . $this->faker->unique()->numerify('2025-#####'),

            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping_fee' => $shipping,
            'discount_total' => $discount,
            'total' => $total,

            'status' => $this->faker->randomElement([
                OrderStatus::PENDING,
                OrderStatus::PAID,
                OrderStatus::IN_PRODUCTION
            ]),
            'payment_status' => $this->faker->randomElement([
                PaymentStatus::UNPAID,
                PaymentStatus::PAID
            ]),

            'shipping_name' => $this->faker->name(),
            'shipping_address' => $this->faker->streetAddress(),
            'shipping_city' => $this->faker->city(),
            'shipping_zip' => $this->faker->postcode(),
            'shipping_country' => $this->faker->countryCode(),

            'placed_at' => $this->faker->optional()->dateTimeBetween('-14 days', 'now'),
        ];
    }
}
