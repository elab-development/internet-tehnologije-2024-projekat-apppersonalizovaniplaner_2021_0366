<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SizeOption;

class SizeOptionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['code' => 'A6', 'label' => 'A6 (105 × 148 mm)', 'price_delta' => 0, 'is_active' => true],
            ['code' => 'A5', 'label' => 'A5 (148 × 210 mm)', 'price_delta' => 2.50, 'is_active' => true],
            ['code' => 'B5', 'label' => 'B5 (176 × 250 mm)', 'price_delta' => 4.00, 'is_active' => true],
        ];

        foreach ($data as $row) {
            SizeOption::updateOrCreate(['code' => $row['code']], $row);
        }
    }
}
