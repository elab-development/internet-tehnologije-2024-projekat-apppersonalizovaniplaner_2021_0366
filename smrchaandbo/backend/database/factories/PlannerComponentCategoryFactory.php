<?php

namespace Database\Factories;

use App\Models\PlannerComponentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PlannerComponentCategoryFactory extends Factory
{
    protected $model = PlannerComponentCategory::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->randomElement([
            'Planning',
            'Habits',
            'Finance',
            'Nutrition',
            'Notes'
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name . '-' . $this->faker->unique()->numerify('###')),
        ];
    }
}
