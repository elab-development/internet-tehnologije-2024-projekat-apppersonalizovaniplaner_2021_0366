<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Planner, PlannerComponentItem, PlannerComponent};

class PlannerComponentItemSeeder extends Seeder
{
    public function run(): void
    {
        $components = PlannerComponent::where('is_active', true)->get();
        if ($components->isEmpty()) return;

        foreach (Planner::all() as $planner) {
            $selection = $components->shuffle()->take(rand(2, 5));

            $componentsTotal = 0.00;

            $sort = 0;
            foreach ($selection as $comp) {
                $qty  = match ($comp->title) {
                    'Weekly Spread'   => 52,
                    'Monthly Planner' => 12,
                    'Notes Section'   => 20,
                    'Dot Grid'        => 20,
                    default           => rand(1, 12),
                };

                $unit = (float) $comp->base_price;
                $line = round($unit * $qty, 2);

                PlannerComponentItem::create([
                    'planner_id'           => $planner->id,
                    'planner_component_id' => $comp->id,
                    'quantity'             => $qty,
                    'pages'                => $comp->default_pages ? $comp->default_pages * $qty : null,
                    'sort_order'           => $sort++,
                    'config_json'          => null,
                    'unit_price_snapshot'  => $unit,
                    'line_total_snapshot'  => $line,
                ]);

                $componentsTotal += $line;
            }

            // Update planner totals after items
            $planner->components_total = $componentsTotal;
            $planner->final_price = round($planner->base_price + $planner->options_total + $componentsTotal, 2);
            $planner->save();
        }
    }
}
