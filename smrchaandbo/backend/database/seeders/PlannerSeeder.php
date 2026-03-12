<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Planner, PlannerStatus, User, SizeOption, PaperOption, BindingOption, ColorOption, CoverDesign, PlannerTemplate};

class PlannerSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'customer')->get();
        if ($users->isEmpty()) {
            $users = User::factory()->count(3)->create(['role' => 'customer']);
        }

        $sizes   = SizeOption::pluck('id')->all();
        $papers  = PaperOption::pluck('id')->all();
        $bindings = BindingOption::pluck('id')->all();
        $colors  = ColorOption::pluck('id')->all();
        $covers  = CoverDesign::pluck('id')->all();
        $templates = PlannerTemplate::pluck('id')->all();

        foreach ($users as $user) {
            // Create 2 planners per customer with realistic combinations
            for ($i = 0; $i < 2; $i++) {
                $base = fake()->randomFloat(2, 8, 20);
                $opt  = fake()->randomFloat(2, 0, 10);
                $comp = 0.00;
                $final = $base + $opt + $comp;

                Planner::create([
                    'user_id'         => $user->id,
                    'title'           => fake()->optional()->sentence(3),
                    'custom_title_text' => fake()->optional()->words(2, true),

                    'size_option_id'  => $sizes ? fake()->randomElement($sizes) : null,
                    'paper_option_id' => $papers ? fake()->randomElement($papers) : null,
                    'binding_option_id' => $bindings ? fake()->randomElement($bindings) : null,
                    'color_option_id' => $colors ? fake()->randomElement($colors) : null,
                    'cover_design_id' => $covers ? fake()->randomElement($covers) : null,
                    'template_id'     => $templates ? fake()->optional(0.6)->randomElement($templates) : null,

                    'pages_estimate'  => fake()->optional()->numberBetween(80, 220),

                    'base_price'      => $base,
                    'options_total'   => $opt,
                    'components_total' => $comp,
                    'final_price'     => $final,

                    'status'          => fake()->randomElement([PlannerStatus::DRAFT, PlannerStatus::READY]),
                ]);
            }
        }
    }
}
