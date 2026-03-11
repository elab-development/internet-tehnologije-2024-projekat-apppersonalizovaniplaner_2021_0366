<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\PlannerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserAdminController;

/*
|--------------------------------------------------------------------------
| Authenticated utility
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/me', [MeController::class, 'show'])->name('me');
/*
|--------------------------------------------------------------------------
| Public Catalog (read-only)
|--------------------------------------------------------------------------
*/
Route::prefix('catalog')->group(function () {
   Route::get('/sizes',                [CatalogController::class, 'sizesIndex'])->name('catalog.sizes.index');
    Route::get('/papers',               [CatalogController::class, 'papersIndex'])->name('catalog.papers.index');
    Route::get('/bindings',             [CatalogController::class, 'bindingsIndex'])->name('catalog.bindings.index');
    Route::get('/colors',               [CatalogController::class, 'colorsIndex'])->name('catalog.colors.index');
    Route::get('/covers',               [CatalogController::class, 'coversIndex'])->name('catalog.covers.index');
    Route::get('/templates',            [CatalogController::class, 'templatesIndex'])->name('catalog.templates.index');
    Route::get('/component-categories', [CatalogController::class, 'componentCategoriesIndex'])->name('catalog.componentCategories.index');
    Route::get('/components',           [CatalogController::class, 'componentsIndex'])->name('catalog.components.index');
});

/*
|--------------------------------------------------------------------------
| Admin Catalog (write)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('catalog')
     ->as('catalog.')
    ->group(function () {
        // Sizes
         Route::post('/sizes',        [CatalogController::class, 'sizesStore'])->name('sizes.store');
        Route::put('/sizes/{id}',   [CatalogController::class, 'sizesUpdate'])->name('sizes.update');
        Route::delete('/sizes/{id}',   [CatalogController::class, 'sizesDestroy'])->name('sizes.destroy');

        // Papers
         Route::post('/papers',       [CatalogController::class, 'papersStore'])->name('papers.store');
        Route::put('/papers/{id}',  [CatalogController::class, 'papersUpdate'])->name('papers.update');
        Route::delete('/papers/{id}',  [CatalogController::class, 'papersDestroy'])->name('papers.destroy');

        // Bindings
        Route::post('/bindings',     [CatalogController::class, 'bindingsStore'])->name('bindings.store');
        Route::put('/bindings/{id}', [CatalogController::class, 'bindingsUpdate'])->name('bindings.update');
        Route::delete('/bindings/{id}', [CatalogController::class, 'bindingsDestroy'])->name('bindings.destroy');

        // Colors
         Route::post('/colors',       [CatalogController::class, 'colorsStore'])->name('colors.store');
        Route::put('/colors/{id}',  [CatalogController::class, 'colorsUpdate'])->name('colors.update');
        Route::delete('/colors/{id}',  [CatalogController::class, 'colorsDestroy'])->name('colors.destroy');

        // Covers
        Route::post('/covers',       [CatalogController::class, 'coversStore'])->name('covers.store');
        Route::put('/covers/{id}',  [CatalogController::class, 'coversUpdate'])->name('covers.update');
        Route::delete('/covers/{id}',  [CatalogController::class, 'coversDestroy'])->name('covers.destroy');


        // Templates
        Route::post('/templates',        [CatalogController::class, 'templatesStore'])->name('templates.store');
        Route::put('/templates/{id}',   [CatalogController::class, 'templatesUpdate'])->name('templates.update');
        Route::delete('/templates/{id}',   [CatalogController::class, 'templatesDestroy'])->name('templates.destroy');

        // Component categories
        Route::post('/component-categories',        [CatalogController::class, 'componentCategoriesStore'])->name('componentCategories.store');
        Route::put('/component-categories/{id}',   [CatalogController::class, 'componentCategoriesUpdate'])->name('componentCategories.update');
        Route::delete('/component-categories/{id}',   [CatalogController::class, 'componentCategoriesDestroy'])->name('componentCategories.destroy');

        // Components
        Route::post('/components',        [CatalogController::class, 'componentsStore'])->name('components.store');
        Route::put('/components/{id}',   [CatalogController::class, 'componentsUpdate'])->name('components.update');
        Route::delete('/components/{id}',   [CatalogController::class, 'componentsDestroy'])->name('components.destroy');
    });
/*
|--------------------------------------------------------------------------
| Planners
| - Read/update/delete: any authenticated user within their scope (admin sees all)
| - Create: customers only (separate resource registration with middleware)
|--------------------------------------------------------------------------
*/

// Read/Update/Delete (auth)

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('planners', PlannerController::class)
        ->only(['index', 'show', 'update', 'destroy'])
        ->names([
            'index'   => 'planners.index',
            'show'    => 'planners.show',
            'update'  => 'planners.update',
            'destroy' => 'planners.destroy',
        ]);

    // Nested items (owner or admin, enforced in controller)
    Route::get('/planners/{id}/items',                 [PlannerController::class, 'itemsIndex'])->name('planners.items.index');
    Route::post('/planners/{id}/recalculate',           [PlannerController::class, 'recalculate'])->name('planners.recalculate');
});

    // Create (customers only)
Route::middleware(['auth:sanctum', 'customer'])->group(function () {
    Route::apiResource('planners', PlannerController::class)
        ->only(['store'])
        ->names(['store' => 'planners.store']);

    Route::post('/planners/{id}/items',                  [PlannerController::class, 'itemsStore'])->name('planners.items.store');
    Route::put('/planners/{id}/items/{itemId}',         [PlannerController::class, 'itemsUpdate'])->name('planners.items.update');
    Route::delete('/planners/{id}/items/{itemId}',        [PlannerController::class, 'itemsDestroy'])->name('planners.items.destroy');
});

    /*
|--------------------------------------------------------------------------
| Orders
| - Read/Update: auth (controller enforces owner vs admin rules)
| - Create: customers only
| - Admin status transitions: admin only
|--------------------------------------------------------------------------
*/

    // Read/Update (auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('orders', OrderController::class)
        ->only(['index', 'show', 'update'])
        ->names([
            'index'  => 'orders.index',
            'show'   => 'orders.show',
            'update' => 'orders.update',
        ]);

    // Customer cancel pending
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
});

// Create (customers only)
Route::middleware(['auth:sanctum', 'customer'])->post('/orders', [OrderController::class, 'store'])->name('orders.store');

// Admin transitions
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/orders/{id}/mark-paid',      [OrderController::class, 'markPaid'])->name('orders.markPaid');
    Route::post('/orders/{id}/mark-refunded',  [OrderController::class, 'markRefunded'])->name('orders.markRefunded');
    Route::post('/orders/{id}/in-production',  [OrderController::class, 'markInProduction'])->name('orders.inProduction');
    Route::post('/orders/{id}/mark-shipped',   [OrderController::class, 'markShipped'])->name('orders.markShipped');
    Route::post('/orders/{id}/mark-delivered', [OrderController::class, 'markDelivered'])->name('orders.markDelivered');
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/users', [UserAdminController::class, 'index'])->name('users.index');
});