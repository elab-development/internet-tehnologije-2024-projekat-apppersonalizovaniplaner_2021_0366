<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlannerComponentCategory;
use Illuminate\Support\Str;

class PlannerComponentCategorySeeder extends Seeder
{
    public function run(): void
    {
        $names = ['Planning', 'Habits', 'Finance', 'Nutrition', 'Notes', 'Wellbeing'];
        foreach ($names as $name) {
            PlannerComponentCategory::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'slug' => Str::slug($name)]
            );
        }
    }
}
