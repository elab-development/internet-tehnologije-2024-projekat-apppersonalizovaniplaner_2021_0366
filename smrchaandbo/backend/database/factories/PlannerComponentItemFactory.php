<?php

namespace Database\Factories;

use App\Models\PlannerComponentItem;
use App\Models\Planner;
use App\Models\PlannerComponent;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlannerComponentItemFactory extends Factory
{
    protected $model = PlannerComponentItem::class;

    public function definition(): array
    {
        $qty = $this->faker->numberBetween(1, 12);
        $unit = $this->faker->randomFloat(2, 0, 5);

        return [
            'planner_id' => Planner::factory(),
            'planner_component_id' => PlannerComponent::factory(),
            'quantity' => $qty,
            'pages' => $this->faker->optional()->numberBetween(1, 20),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'config_json' => $this->faker->optional()->randomElement([
                ['layout' => 'grid', 'startOnMonday' => true],
                ['layout' => 'lined', 'iconSet' => 'minimal'],
                null
            ]),
            'unit_price_snapshot' => $unit,
            'line_total_snapshot' => round($unit * $qty, 2),
        ];
    }
}
