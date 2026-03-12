<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaperOption;

class PaperOptionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['label' => 'Ivory 90gsm',  'gsm' => 90,  'price_delta' => 0.00, 'is_active' => true],
            ['label' => 'White 100gsm', 'gsm' => 100, 'price_delta' => 1.50, 'is_active' => true],
            ['label' => 'Ivory 120gsm', 'gsm' => 120, 'price_delta' => 3.00, 'is_active' => true],
        ];
        foreach ($data as $row) {
            PaperOption::updateOrCreate(['label' => $row['label']], $row);
        }
    }
}
