<?php

namespace Database\Factories;

use App\Models\CoverDesign;
use Illuminate\Database\Eloquent\Factories\Factory;

class CoverDesignFactory extends Factory
{
    protected $model = CoverDesign::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->words(2, true),
            'image_url' => $this->faker->imageUrl(800, 600, 'abstract', true),
            'price_delta' => $this->faker->randomFloat(2, 0, 15),
            'is_active' => true,
        ];
    }
}
