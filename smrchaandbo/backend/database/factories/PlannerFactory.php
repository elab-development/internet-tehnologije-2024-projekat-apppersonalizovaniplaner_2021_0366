<?php

namespace Database\Factories;

use App\Models\Planner;
use App\Models\PlannerStatus;
use App\Models\User;
use App\Models\SizeOption;
use App\Models\PaperOption;
use App\Models\BindingOption;
use App\Models\ColorOption;
use App\Models\CoverDesign;
use App\Models\PlannerTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlannerFactory extends Factory
{
    protected $model = Planner::class;

    public function definition(): array
    {
        $base = $this->faker->randomFloat(2, 8, 20);
        $opt  = $this->faker->randomFloat(2, 0, 10);
        $comp = $this->faker->randomFloat(2, 0, 25);
        $final = $base + $opt + $comp;

        return [
            'user_id' => User::factory(),
            'title' => $this->faker->optional()->sentence(3),
            'custom_title_text' => $this->faker->optional()->words(2, true),

            'size_option_id' => SizeOption::factory(),
            'paper_option_id' => PaperOption::factory(),
            'binding_option_id' => BindingOption::factory(),
            'color_option_id' => ColorOption::factory(),
            'cover_design_id' => CoverDesign::factory(),
            'template_id' => $this->faker->boolean(60) ? PlannerTemplate::factory() : null,

            'pages_estimate' => $this->faker->optional()->numberBetween(60, 240),

            'base_price' => $base,
            'options_total' => $opt,
            'components_total' => $comp,
            'final_price' => $final,

            'status' => $this->faker->randomElement([PlannerStatus::DRAFT, PlannerStatus::READY]),
        ];
    }
}
