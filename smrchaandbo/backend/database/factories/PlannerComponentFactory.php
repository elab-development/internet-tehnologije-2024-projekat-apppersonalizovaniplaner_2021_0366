<?php

namespace Database\Factories;

use App\Models\PlannerComponent;
use App\Models\PlannerComponentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PlannerComponentFactory extends Factory
{
    protected $model = PlannerComponent::class;

    public function definition(): array
    {
        $title = $this->faker->randomElement([
            'Weekly Spread',
            'Monthly Planner',
            'Habit Tracker',
            'Budget',
            'Meal Planner',
            'Notes Section'
        ]);

        return [
            'slug' => Str::slug($title . '-' . $this->faker->unique()->numerify('###')),
            'title' => $title,
            'description' => $this->faker->optional()->paragraph(),
            'base_price' => $this->faker->randomFloat(2, 0, 10),
            'default_pages' => $this->faker->optional()->numberBetween(1, 10),
            'max_repeats' => $this->faker->optional()->numberBetween(1, 60),
            'category_id' => PlannerComponentCategory::factory(),
            'is_active' => true,
        ];
    }
}
