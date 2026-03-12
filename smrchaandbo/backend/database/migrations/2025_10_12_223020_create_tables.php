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
        // OPTION TABLES
        Schema::create('size_options', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('label');
            $table->decimal('price_delta', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('paper_options', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->unsignedSmallInteger('gsm')->nullable();
            $table->decimal('price_delta', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('binding_options', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->decimal('price_delta', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('color_options', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('hex', 7)->nullable();
            $table->decimal('price_delta', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cover_designs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image_url')->nullable();
            $table->decimal('price_delta', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('planner_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('planner_component_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->timestamps();
        });

        // PLANNERS
        Schema::create('planners', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('size_option_id')->nullable();
            $table->unsignedBigInteger('paper_option_id')->nullable();
            $table->unsignedBigInteger('binding_option_id')->nullable();
            $table->unsignedBigInteger('color_option_id')->nullable();
            $table->unsignedBigInteger('cover_design_id')->nullable();
            $table->unsignedBigInteger('template_id')->nullable();

            $table->string('title')->nullable();
            $table->string('custom_title_text')->nullable();

            $table->unsignedInteger('pages_estimate')->nullable();

            $table->decimal('base_price', 10, 2)->default(0);
            $table->decimal('options_total', 10, 2)->default(0);
            $table->decimal('components_total', 10, 2)->default(0);
            $table->decimal('final_price', 10, 2)->default(0);

            $table->enum('status', ['draft', 'ready', 'archived'])->default('draft');

            $table->timestamps();
        });

        Schema::create('planner_components', function (Blueprint $table) {
            $table->id();
            $table->string('slug');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2)->default(0);
            $table->unsignedInteger('default_pages')->nullable();
            $table->unsignedInteger('max_repeats')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // PLANNER COMPONENT ITEMS
        Schema::create('planner_component_items', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('planner_id');
            $table->unsignedBigInteger('planner_component_id');

            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('pages')->nullable();
            $table->unsignedInteger('sort_order')->default(0);

            $table->json('config_json')->nullable();

            $table->decimal('unit_price_snapshot', 10, 2)->default(0);
            $table->decimal('line_total_snapshot', 10, 2)->default(0);

            $table->timestamps();
        });

        // ORDERS
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('planner_id');

            $table->string('order_number');

            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('shipping_fee', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);

            $table->enum('status', [
                'pending',
                'paid',
                'in_production',
                'shipped',
                'delivered',
                'canceled',
                'refunded'
            ])->default('pending');

            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');

            $table->string('shipping_name')->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_zip')->nullable();
            $table->string('shipping_country')->nullable();

            $table->dateTime('placed_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('planner_component_items');
        Schema::dropIfExists('planner_components');
        Schema::dropIfExists('planners');
        Schema::dropIfExists('planner_component_categories');
        Schema::dropIfExists('planner_templates');
        Schema::dropIfExists('cover_designs');
        Schema::dropIfExists('color_options');
        Schema::dropIfExists('binding_options');
        Schema::dropIfExists('paper_options');
        Schema::dropIfExists('size_options');
    }
};