<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BindingOption;

class BindingOptionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['label' => 'Spiral',   'price_delta' => 0.00, 'is_active' => true],
            ['label' => 'Softcover', 'price_delta' => 2.50, 'is_active' => true],
            ['label' => 'Hardcover', 'price_delta' => 6.00, 'is_active' => true],
        ];
        foreach ($data as $row) {
            BindingOption::updateOrCreate(['label' => $row['label']], $row);
        }
    }
}
