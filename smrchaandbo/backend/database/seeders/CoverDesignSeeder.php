<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CoverDesign;

class CoverDesignSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'name' => 'Minimal Grid',
                'image_url' => '/covers/minimal-grid.jpg',
                'price_delta' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Marble Classic',
                'image_url' => '/covers/marble-classic.jpg',
                'price_delta' => 2.00,
                'is_active' => true
            ],
            [
                'name' => 'Floral Spring',
                'image_url' => '/covers/floral-spring.jpg',
                'price_delta' => 1.50,
                'is_active' => true
            ],
            [
                'name' => 'Matte Solid',
                'image_url' => '/covers/matte-solid.jpg',
                'price_delta' => 0.00,
                'is_active' => true
            ],
        ];
        foreach ($data as $row) {
            CoverDesign::updateOrCreate(['name' => $row['name']], $row);
        }
    }
}
