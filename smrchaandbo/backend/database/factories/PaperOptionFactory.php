<?php

namespace Database\Factories;

use App\Models\PaperOption;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaperOptionFactory extends Factory
{
    protected $model = PaperOption::class;

    public function definition(): array
    {
        return [
            'label' => $this->faker->randomElement(['Ivory 90gsm', 'White 100gsm', 'Ivory 120gsm']),
            'gsm' => $this->faker->randomElement([90, 100, 120]),
            'price_delta' => $this->faker->randomFloat(2, 0, 8),
            'is_active' => true,
        ];
    }
}
