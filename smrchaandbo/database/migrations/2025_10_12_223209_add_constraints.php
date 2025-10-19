<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE planners
            ADD CONSTRAINT chk_planners_prices_nonneg
            CHECK (base_price >= 0 AND options_total >= 0 AND components_total >= 0 AND final_price >= 0)");

        DB::statement("ALTER TABLE planner_components
            ADD CONSTRAINT chk_planner_components_price_nonneg
            CHECK (base_price >= 0)");

        DB::statement("ALTER TABLE planner_component_items
            ADD CONSTRAINT chk_planner_component_items_nonneg
            CHECK (quantity > 0 AND unit_price_snapshot >= 0 AND line_total_snapshot >= 0)");

        DB::statement("ALTER TABLE orders
            ADD CONSTRAINT chk_orders_totals_nonneg
            CHECK (subtotal >= 0 AND tax >= 0 AND shipping_fee >= 0 AND discount_total >= 0 AND total >= 0)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE planners DROP CONSTRAINT IF EXISTS chk_planners_prices_nonneg");
        DB::statement("ALTER TABLE planner_components DROP CONSTRAINT IF EXISTS chk_planner_components_price_nonneg");
        DB::statement("ALTER TABLE planner_component_items DROP CONSTRAINT IF EXISTS chk_planner_component_items_nonneg");
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_totals_nonneg");
    }
};