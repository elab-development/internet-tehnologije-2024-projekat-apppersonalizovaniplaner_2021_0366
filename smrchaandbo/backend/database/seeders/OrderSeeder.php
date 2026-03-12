<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Order, OrderStatus, PaymentStatus, Planner, User};
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $planners  = Planner::where('status', '!=', 'archived')->get();

        if ($customers->isEmpty() || $planners->isEmpty()) return;

        // Create 1–2 orders per customer referencing existing planners
        foreach ($customers as $user) {
            $userPlanners = $planners->where('user_id', $user->id)->values();
            if ($userPlanners->isEmpty()) continue;

            $count = rand(1, 2);
            for ($i = 0; $i < $count; $i++) {
                $planner = $userPlanners->random();
                $subtotal = (float) $planner->final_price;
                $tax = round($subtotal * 0.10, 2);
                $shipping = 3.99;
                $discount = fake()->boolean(15) ? round(min($subtotal * 0.1, 5), 2) : 0.00;
                $total = max(0, round($subtotal + $tax + $shipping - $discount, 2));

                $paid = fake()->boolean(70);

                Order::create([
                    'user_id'          => $user->id,
                    'planner_id'       => $planner->id,
                    'order_number'     => 'SBO-' . now()->format('Y') . '-' . strtoupper(Str::random(6)),

                    'subtotal'         => $subtotal,
                    'tax'              => $tax,
                    'shipping_fee'     => $shipping,
                    'discount_total'   => $discount,
                    'total'            => $total,

                    'status'           => $paid ? OrderStatus::PAID : OrderStatus::PENDING,
                    'payment_status'   => $paid ? PaymentStatus::PAID : PaymentStatus::UNPAID,

                    'shipping_name'    => $user->name,
                    'shipping_address' => fake()->streetAddress(),
                    'shipping_city'    => fake()->city(),
                    'shipping_zip'     => fake()->postcode(),
                    'shipping_country' => 'RS',

                    'placed_at'        => fake()->dateTimeBetween('-30 days', 'now'),
                ]);
            }
        }
    }
}
