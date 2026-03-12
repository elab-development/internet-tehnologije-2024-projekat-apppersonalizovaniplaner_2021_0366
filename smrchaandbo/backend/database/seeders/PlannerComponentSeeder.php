<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlannerComponent;
use App\Models\PlannerComponentCategory;
use Illuminate\Support\Str;

class PlannerComponentSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'Planning'  => [
                [
                    'Weekly Spread',
                    'Weekly overview with space for priorities.',
                    1.00,
                    2,
                    60
                ],
                [
                    'Monthly Planner',
                    'Monthly calendar grid and goals section.',
                    1.50,
                    4,
                    12
                ],
                [
                    'Project Tracker',
                    'Project milestones, tasks, and deadlines.',
                    1.80,
                    2,
                    20
                ],
            ],
            'Habits'    => [
                [
                    'Habit Tracker',
                    'Track daily habits and streaks.',
                    0.90,
                    1,
                    12
                ],
                [
                    'Mood Tracker',
                    'Record daily mood and reflections.',
                    0.90,
                    1,
                    12
                ],
            ],
            'Finance'   => [
                [
                    'Budget',
                    'Monthly income/expense and savings tracker.',
                    1.20,
                    2,
                    12
                ],
                [
                    'Expense Log',
                    'Daily/weekly expense logging.',
                    1.00,
                    2,
                    52
                ],
            ],
            'Nutrition' => [
                [
                    'Meal Planner',
                    'Weekly meal plan with shopping list.',
                    1.10,
                    2,
                    52
                ],
                [
                    'Recipes',
                    'Recipe notes and ratings.',
                    0.80,
                    4,
                    50
                ],
            ],
            'Notes'     => [
                [
                    'Notes Section',
                    'Lined pages for general notes.',
                    0.50,
                    10,
                    200
                ],
                [
                    'Dot Grid',
                    'Dot-grid pages for sketches and layouts.',
                    0.60,
                    10,
                    200
                ],
            ],
            'Wellbeing' => [
                [
                    'Gratitude Log',
                    'Daily gratitude prompts.',
                    0.80,
                    1,
                    12
                ],
                [
                    'Sleep Tracker',
                    'Sleep routine and quality tracking.',
                    0.80,
                    1,
                    12
                ],
            ],
        ];

        foreach ($map as $category => $components) {
            $cat = PlannerComponentCategory::where('name', $category)->first();
            foreach ($components as [$title, $desc, $price, $defaultPages, $maxRepeats]) {
                PlannerComponent::updateOrCreate(
                    ['slug' => Str::slug($title)],
                    [
                        'slug'          => Str::slug($title),
                        'title'         => $title,
                        'description'   => $desc,
                        'base_price'    => $price,
                        'default_pages' => $defaultPages,
                        'max_repeats'   => $maxRepeats,
                        'category_id'   => $cat?->id,
                        'is_active'     => true,
                    ]
                );
            }
        }
    }
}
