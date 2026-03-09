<?php

namespace Database\Factories;

use App\Models\PlannerTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlannerTemplateFactory extends Factory
{
    protected $model = PlannerTemplate::class;

    public function definition(): array
    {
        return [
            'name' => 'Template ' . $this->faker->unique()->numerify('###'),
            'description' => $this->faker->optional()->sentence(12),
            'base_price' => $this->faker->randomFloat(2, 5, 25),
            'is_active' => true,
        ];
    }
}
