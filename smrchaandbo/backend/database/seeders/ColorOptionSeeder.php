<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ColorOption;

class ColorOptionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['name' => 'Midnight Blue', 'hex' => '#003366', 'price_delta' => 0.00, 'is_active' => true],
            ['name' => 'Forest Green',  'hex' => '#228B22', 'price_delta' => 0.00, 'is_active' => true],
            ['name' => 'Blush Pink',    'hex' => '#FFC0CB', 'price_delta' => 0.50, 'is_active' => true],
            ['name' => 'Charcoal',      'hex' => '#333333', 'price_delta' => 0.00, 'is_active' => true],
        ];
        foreach ($data as $row) {
            ColorOption::updateOrCreate(['name' => $row['name']], $row);
        }
    }
}
