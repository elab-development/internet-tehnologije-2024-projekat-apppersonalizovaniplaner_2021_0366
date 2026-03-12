<?php

namespace Database\Factories;

use App\Models\BindingOption;
use Illuminate\Database\Eloquent\Factories\Factory;

class BindingOptionFactory extends Factory
{
    protected $model = BindingOption::class;

    public function definition(): array
    {
        return [
            'label' => $this->faker->randomElement(['Spiral', 'Hardcover', 'Softcover']),
            'price_delta' => $this->faker->randomFloat(2, 0, 12),
            'is_active' => true,
        ];
    }
}
