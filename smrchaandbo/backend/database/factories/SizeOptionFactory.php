<?php

namespace Database\Factories;

use App\Models\SizeOption;
use Illuminate\Database\Eloquent\Factories\Factory;

class SizeOptionFactory extends Factory
{
    protected $model = SizeOption::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('A#')),
            'label' => $this->faker->randomElement(['A5', 'A6', 'B5']),
            'price_delta' => $this->faker->randomFloat(2, 0, 10),
            'is_active' => true,
        ];
    }
}
