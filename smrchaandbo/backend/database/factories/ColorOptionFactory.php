<?php

namespace Database\Factories;

use App\Models\ColorOption;
use Illuminate\Database\Eloquent\Factories\Factory;

class ColorOptionFactory extends Factory
{
    protected $model = ColorOption::class;

    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->safeColorName()),
            'hex' => sprintf('#%06X', mt_rand(0, 0xFFFFFF)),
            'price_delta' => $this->faker->randomFloat(2, 0, 5),
            'is_active' => true,
        ];
    }
}
