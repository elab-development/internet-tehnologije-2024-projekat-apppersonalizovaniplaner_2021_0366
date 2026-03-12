<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@smrchaandbo.com'],
            [
                'name' => 'Smrcha&Bo Admin',
                'password' => 'admin123',
                'role' => 'admin'
            ]
        );

        $customers = [
            [
                'name' => 'Ana Marković',
                'email' => 'ana@example.com'
            ],
            [
                'name' => 'Marko Jovanović',
                'email' => 'marko@example.com'
            ],
            [
                'name' => 'Jelena Ilić',
                'email' => 'jelena@example.com'
            ],
        ];
        foreach ($customers as $c) {
            User::firstOrCreate(
                ['email' => $c['email']],
                ['name' => $c['name'], 'password' => 'password', 'role' => 'customer']
            );
        }

        $this->call([
            SizeOptionSeeder::class,
            PaperOptionSeeder::class,
            BindingOptionSeeder::class,
            ColorOptionSeeder::class,
            CoverDesignSeeder::class,
            PlannerTemplateSeeder::class,
            PlannerComponentCategorySeeder::class,
            PlannerComponentSeeder::class,
            PlannerSeeder::class,
            PlannerComponentItemSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
