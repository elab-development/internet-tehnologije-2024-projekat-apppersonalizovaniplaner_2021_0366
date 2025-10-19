<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // USERS
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email', 'users_email_unique');
            $table->index('role', 'users_role_idx');
        });

        // OPTION TABLES
        Schema::table('size_options', function (Blueprint $table) {
            $table->unique('code', 'size_options_code_unique');
            $table->index('is_active', 'size_options_active_idx');
        });
        Schema::table('paper_options', function (Blueprint $table) {
            $table->index('is_active', 'paper_options_active_idx');
        });
        Schema::table('binding_options', function (Blueprint $table) {
            $table->index('is_active', 'binding_options_active_idx');
        });
        Schema::table('color_options', function (Blueprint $table) {
            $table->index('is_active', 'color_options_active_idx');
        });
        Schema::table('cover_designs', function (Blueprint $table) {
            $table->index('is_active', 'cover_designs_active_idx');
        });
        Schema::table('planner_templates', function (Blueprint $table) {
            $table->unique('name', 'planner_templates_name_unique');
            $table->index('is_active', 'planner_templates_active_idx');
        });
        Schema::table('planner_component_categories', function (Blueprint $table) {
            $table->unique('slug', 'pcc_slug_unique');
        });

        // PLANNERS
        Schema::table('planners', function (Blueprint $table) {
            $table->index('user_id', 'planners_user_idx');
            $table->index('size_option_id', 'planners_size_idx');
            $table->index('paper_option_id', 'planners_paper_idx');
            $table->index('binding_option_id', 'planners_binding_idx');
            $table->index('color_option_id', 'planners_color_idx');
            $table->index('cover_design_id', 'planners_cover_idx');
            $table->index('template_id', 'planners_template_idx');
            $table->index('status', 'planners_status_idx');
        });

        // PLANNER COMPONENTS
        Schema::table('planner_components', function (Blueprint $table) {
            $table->unique('slug', 'planner_components_slug_unique');
            $table->index('is_active', 'planner_components_active_idx');
            $table->index('category_id', 'planner_components_category_idx');
        });

        // PLANNER COMPONENT ITEMS
        Schema::table('planner_component_items', function (Blueprint $table) {
            $table->index('planner_id', 'pci_planner_idx');
            $table->index('planner_component_id', 'pci_component_idx');
            $table->index(['planner_id', 'sort_order'], 'pci_planner_sort_idx');
        });

        // ORDERS
        Schema::table('orders', function (Blueprint $table) {
            $table->unique('order_number', 'orders_order_number_unique');
            $table->index('user_id', 'orders_user_idx');
            $table->index('planner_id', 'orders_planner_idx');
            $table->index('status', 'orders_status_idx');
            $table->index('payment_status', 'orders_payment_status_idx');
            $table->index('placed_at', 'orders_placed_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ORDERS
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique('orders_order_number_unique');
            $table->dropIndex('orders_user_idx');
            $table->dropIndex('orders_planner_idx');
            $table->dropIndex('orders_status_idx');
            $table->dropIndex('orders_payment_status_idx');
            $table->dropIndex('orders_placed_at_idx');
        });

        // PLANNER COMPONENT ITEMS
        Schema::table('planner_component_items', function (Blueprint $table) {
            $table->dropIndex('pci_planner_idx');
            $table->dropIndex('pci_component_idx');
            $table->dropIndex('pci_planner_sort_idx');
        });

        // PLANNER COMPONENTS
        Schema::table('planner_components', function (Blueprint $table) {
            $table->dropUnique('planner_components_slug_unique');
            $table->dropIndex('planner_components_active_idx');
            $table->dropIndex('planner_components_category_idx');
        });

        // PLANNERS
        Schema::table('planners', function (Blueprint $table) {
            $table->dropIndex('planners_user_idx');
            $table->dropIndex('planners_size_idx');
            $table->dropIndex('planners_paper_idx');
            $table->dropIndex('planners_binding_idx');
            $table->dropIndex('planners_color_idx');
            $table->dropIndex('planners_cover_idx');
            $table->dropIndex('planners_template_idx');
            $table->dropIndex('planners_status_idx');
        });

        // PLANNER COMPONENT CATEGORIES
        Schema::table('planner_component_categories', function (Blueprint $table) {
            $table->dropUnique('pcc_slug_unique');
        });

        // PLANNER TEMPLATES
        Schema::table('planner_templates', function (Blueprint $table) {
            $table->dropUnique('planner_templates_name_unique');
            $table->dropIndex('planner_templates_active_idx');
        });

        // OPTION TABLES
        Schema::table('cover_designs', function (Blueprint $table) {
            $table->dropIndex('cover_designs_active_idx');
        });
        Schema::table('color_options', function (Blueprint $table) {
            $table->dropIndex('color_options_active_idx');
        });
        Schema::table('binding_options', function (Blueprint $table) {
            $table->dropIndex('binding_options_active_idx');
        });
        Schema::table('paper_options', function (Blueprint $table) {
            $table->dropIndex('paper_options_active_idx');
        });
        Schema::table('size_options', function (Blueprint $table) {
            $table->dropUnique('size_options_code_unique');
            $table->dropIndex('size_options_active_idx');
        });

        // USERS
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique');
            $table->dropIndex('users_role_idx');
        });
    }
};