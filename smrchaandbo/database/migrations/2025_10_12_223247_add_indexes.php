<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /** Check if a named index already exists on a table */
    private function indexExists(string $table, string $indexName): bool
    {
        $sql = "SELECT 1


                  FROM INFORMATION_SCHEMA.STATISTICS


                 WHERE TABLE_SCHEMA = DATABASE()


                   AND TABLE_NAME = ?


                   AND INDEX_NAME = ?


                 LIMIT 1";


        return (bool) DB::selectOne($sql, [$table, $indexName]);
    }

    /** Create a unique index if it doesn't exist */

    private function addUniqueIfMissing(string $table, string $indexName, array|string $columns): void
    {
        if (!$this->indexExists($table, $indexName)) {


            Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {


                $t->unique((array) $columns, $indexName);


            });


        }

    }
    /** Create a (non-unique) index if it doesn't exist */
    private function addIndexIfMissing(string $table, string $indexName, array|string $columns): void
    {
        if (!$this->indexExists($table, $indexName)) {


            Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {


                $t->index((array) $columns, $indexName);


            });


        }
    }

    /** Drop an index if it exists */


    private function dropIndexIfExists(string $table, string $indexName): void


    {


        if ($this->indexExists($table, $indexName)) {


            Schema::table($table, function (Blueprint $t) use ($indexName) {


                $t->dropIndex($indexName);


            });


        }


    }





    /** Drop a unique index if it exists */


    private function dropUniqueIfExists(string $table, string $indexName): void


    {


        if ($this->indexExists($table, $indexName)) {


            Schema::table($table, function (Blueprint $t) use ($indexName) {


                $t->dropUnique($indexName);


            });


        }


    }

    public function up(): void
    {
        // USERS
        $this->addUniqueIfMissing('users', 'users_email_unique', 'email');

        $this->addIndexIfMissing('users', 'users_role_idx', 'role');

        // SIZE OPTIONS

        $this->addUniqueIfMissing('size_options', 'size_options_code_unique', 'code');

        $this->addIndexIfMissing('size_options', 'size_options_active_idx', 'is_active');


        // PAPER/BINDING/COLOR/COVER


        $this->addIndexIfMissing('paper_options', 'paper_options_active_idx', 'is_active');


        $this->addIndexIfMissing('binding_options', 'binding_options_active_idx', 'is_active');


        $this->addIndexIfMissing('color_options', 'color_options_active_idx', 'is_active');


        $this->addIndexIfMissing('cover_designs', 'cover_designs_active_idx', 'is_active');

        // PLANNER TEMPLATES
        $this->addUniqueIfMissing('planner_templates', 'planner_templates_name_unique', 'name');
        $this->addIndexIfMissing('planner_templates', 'planner_templates_active_idx', 'is_active');

        // PLANNER COMPONENT CATEGORIES
        $this->addUniqueIfMissing('planner_component_categories', 'pcc_slug_unique', 'slug');

        //PlaNNERS
         $this->addIndexIfMissing('planners', 'planners_user_idx', 'user_id');

        $this->addIndexIfMissing('planners', 'planners_size_idx', 'size_option_id');


        $this->addIndexIfMissing('planners', 'planners_paper_idx', 'paper_option_id');


        $this->addIndexIfMissing('planners', 'planners_binding_idx', 'binding_option_id');


        $this->addIndexIfMissing('planners', 'planners_color_idx', 'color_option_id');


        $this->addIndexIfMissing('planners', 'planners_cover_idx', 'cover_design_id');


        $this->addIndexIfMissing('planners', 'planners_template_idx', 'template_id');


        $this->addIndexIfMissing('planners', 'planners_status_idx', 'status');

        // PLANNER COMPONENTS
         $this->addUniqueIfMissing('planner_components', 'planner_components_slug_unique', 'slug');



        $this->addIndexIfMissing('planner_components', 'planner_components_active_idx', 'is_active');


        $this->addIndexIfMissing('planner_components', 'planner_components_category_idx', 'category_id');



        // PLANNER COMPONENT ITEMS
       $this->addIndexIfMissing('planner_component_items', 'pci_planner_idx', 'planner_id');



        $this->addIndexIfMissing('planner_component_items', 'pci_component_idx', 'planner_component_id');


        $this->addIndexIfMissing('planner_component_items', 'pci_planner_sort_idx', ['planner_id', 'sort_order']);

        // ORDERS
        $this->addUniqueIfMissing('orders', 'orders_order_number_unique', 'order_number');



        $this->addIndexIfMissing('orders', 'orders_user_idx', 'user_id');


        $this->addIndexIfMissing('orders', 'orders_planner_idx', 'planner_id');


        $this->addIndexIfMissing('orders', 'orders_status_idx', 'status');


        $this->addIndexIfMissing('orders', 'orders_payment_status_idx', 'payment_status');


        $this->addIndexIfMissing('orders', 'orders_placed_at_idx', 'placed_at');
    }

    public function down(): void
    {
        // ORDERS
       $this->dropUniqueIfExists('orders', 'orders_order_number_unique');



        $this->dropIndexIfExists('orders', 'orders_user_idx');


        $this->dropIndexIfExists('orders', 'orders_planner_idx');


        $this->dropIndexIfExists('orders', 'orders_status_idx');


        $this->dropIndexIfExists('orders', 'orders_payment_status_idx');


        $this->dropIndexIfExists('orders', 'orders_placed_at_idx');

        // PLANNER COMPONENT ITEMS
        $this->dropIndexIfExists('planner_component_items', 'pci_planner_idx');



        $this->dropIndexIfExists('planner_component_items', 'pci_component_idx');


        $this->dropIndexIfExists('planner_component_items', 'pci_planner_sort_idx');

        // PLANNER COMPONENTS
        $this->dropUniqueIfExists('planner_components', 'planner_components_slug_unique');



        $this->dropIndexIfExists('planner_components', 'planner_components_active_idx');


        $this->dropIndexIfExists('planner_components', 'planner_components_category_idx');

        // PLANNERS
        $this->dropIndexIfExists('planners', 'planners_user_idx');



        $this->dropIndexIfExists('planners', 'planners_size_idx');


        $this->dropIndexIfExists('planners', 'planners_paper_idx');


        $this->dropIndexIfExists('planners', 'planners_binding_idx');


        $this->dropIndexIfExists('planners', 'planners_color_idx');


        $this->dropIndexIfExists('planners', 'planners_cover_idx');


        $this->dropIndexIfExists('planners', 'planners_template_idx');


        $this->dropIndexIfExists('planners', 'planners_status_idx');

        // PLANNER COMPONENT CATEGORIES
               $this->dropUniqueIfExists('planner_component_categories', 'pcc_slug_unique');

        // PLANNER TEMPLATES
       $this->dropUniqueIfExists('planner_templates', 'planner_templates_name_unique');

        $this->dropIndexIfExists('planner_templates', 'planner_templates_active_idx');

        // OPTION TABLES
       $this->dropIndexIfExists('cover_designs', 'cover_designs_active_idx');



        $this->dropIndexIfExists('color_options', 'color_options_active_idx');


        $this->dropIndexIfExists('binding_options', 'binding_options_active_idx');


        $this->dropIndexIfExists('paper_options', 'paper_options_active_idx');


        $this->dropUniqueIfExists('size_options', 'size_options_code_unique');


        $this->dropIndexIfExists('size_options', 'size_options_active_idx');

        // USERS
         $this->dropUniqueIfExists('users', 'users_email_unique');

        $this->dropIndexIfExists('users', 'users_role_idx');
    }
};