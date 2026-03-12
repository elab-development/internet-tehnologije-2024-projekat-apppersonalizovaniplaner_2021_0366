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
        // planners
        Schema::table('planners', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('size_option_id')->references('id')->on('size_options')->nullOnDelete();
            $table->foreign('paper_option_id')->references('id')->on('paper_options')->nullOnDelete();
            $table->foreign('binding_option_id')->references('id')->on('binding_options')->nullOnDelete();
            $table->foreign('color_option_id')->references('id')->on('color_options')->nullOnDelete();
            $table->foreign('cover_design_id')->references('id')->on('cover_designs')->nullOnDelete();
            $table->foreign('template_id')->references('id')->on('planner_templates')->nullOnDelete();
        });

        // planner_components
        Schema::table('planner_components', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('planner_component_categories')->nullOnDelete();
        });

        // planner_component_items
        Schema::table('planner_component_items', function (Blueprint $table) {
            $table->foreign('planner_id')->references('id')->on('planners')->cascadeOnDelete();
            $table->foreign('planner_component_id')->references('id')->on('planner_components')->restrictOnDelete();
        });

        // orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('planner_id')->references('id')->on('planners')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['planner_id']);
        });

        Schema::table('planner_component_items', function (Blueprint $table) {
            $table->dropForeign(['planner_id']);
            $table->dropForeign(['planner_component_id']);
        });

        Schema::table('planner_components', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('planners', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['size_option_id']);
            $table->dropForeign(['paper_option_id']);
            $table->dropForeign(['binding_option_id']);
            $table->dropForeign(['color_option_id']);
            $table->dropForeign(['cover_design_id']);
            $table->dropForeign(['template_id']);
        });
    }
};