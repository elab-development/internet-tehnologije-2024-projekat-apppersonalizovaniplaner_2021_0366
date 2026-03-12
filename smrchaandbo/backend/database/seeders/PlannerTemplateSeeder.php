<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlannerTemplate;

class PlannerTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'name' => 'Daily Focus',
                'description' => 'Daily layout for tasks, schedule, and notes.',
                'base_price' => 11.90,
                'is_active' => true
            ],
            [
                'name' => 'Weekly Pro',
                'description' => 'Weekly spread with habit and goal tracking.',
                'base_price' => 9.90,
                'is_active' => true
            ],
            [
                'name' => 'Student Pack',
                'description' => 'Academic planner with timetable and exams.',
                'base_price' => 8.90,
                'is_active' => true
            ],
        ];
        foreach ($data as $row) {
            PlannerTemplate::updateOrCreate(['name' => $row['name']], $row);
        }
    }
}
