<?php

use App\Http\Controllers\Api\CatalogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\PlannerController;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [MeController::class, 'show']);
});
/**
 * PUBLIC (no auth): read-only catalog endpoints
 */
Route::prefix('catalog')->group(function () {
    Route::get('/sizes',                [CatalogController::class, 'sizesIndex']);
    Route::get('/papers',               [CatalogController::class, 'papersIndex']);
    Route::get('/bindings',             [CatalogController::class, 'bindingsIndex']);
    Route::get('/colors',               [CatalogController::class, 'colorsIndex']);
    Route::get('/covers',               [CatalogController::class, 'coversIndex']);
    Route::get('/templates',            [CatalogController::class, 'templatesIndex']);
    Route::get('/component-categories', [CatalogController::class, 'componentCategoriesIndex']);
    Route::get('/components',           [CatalogController::class, 'componentsIndex']); // ?category_id=&active_only=&search=
});

/**
 * ADMIN (auth + admin): write endpoints
 */
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('catalog')
    ->group(function () {
        // Sizes
        Route::post('/sizes',        [CatalogController::class, 'sizesStore']);
        Route::put('/sizes/{id}',   [CatalogController::class, 'sizesUpdate']);
        Route::delete('/sizes/{id}',   [CatalogController::class, 'sizesDestroy']);

        // Papers
        Route::post('/papers',       [CatalogController::class, 'papersStore']);
        Route::put('/papers/{id}',  [CatalogController::class, 'papersUpdate']);
        Route::delete('/papers/{id}',  [CatalogController::class, 'papersDestroy']);

        // Bindings
        Route::post('/bindings',     [CatalogController::class, 'bindingsStore']);
        Route::put('/bindings/{id}', [CatalogController::class, 'bindingsUpdate']);
        Route::delete('/bindings/{id}', [CatalogController::class, 'bindingsDestroy']);

        // Colors
        Route::post('/colors',       [CatalogController::class, 'colorsStore']);
        Route::put('/colors/{id}',  [CatalogController::class, 'colorsUpdate']);
        Route::delete('/colors/{id}',  [CatalogController::class, 'colorsDestroy']);

        // Covers
        Route::post('/covers',       [CatalogController::class, 'coversStore']);
        Route::put('/covers/{id}',  [CatalogController::class, 'coversUpdate']);
        Route::delete('/covers/{id}',  [CatalogController::class, 'coversDestroy']);

        // Templates
        Route::post('/templates',        [CatalogController::class, 'templatesStore']);
        Route::put('/templates/{id}',   [CatalogController::class, 'templatesUpdate']);
        Route::delete('/templates/{id}',   [CatalogController::class, 'templatesDestroy']);

        // Component categories
        Route::post('/component-categories',      [CatalogController::class, 'componentCategoriesStore']);
        Route::put('/component-categories/{id}', [CatalogController::class, 'componentCategoriesUpdate']);
        Route::delete('/component-categories/{id}', [CatalogController::class, 'componentCategoriesDestroy']);

        // Components
        Route::post('/components',      [CatalogController::class, 'componentsStore']);
        Route::put('/components/{id}', [CatalogController::class, 'componentsUpdate']);
        Route::delete('/components/{id}', [CatalogController::class, 'componentsDestroy']);
    });


Route::middleware('auth:sanctum')->group(function () {
    // List planners:
    // - Admin: sees all (optionally filter by user_id)
    // - Customer: sees only their planners
    Route::get('/planners', [PlannerController::class, 'index']);

    // Create (customers only)
    Route::post('/planners', [PlannerController::class, 'store']);

    // Read one (owner or admin)
    Route::get('/planners/{id}', [PlannerController::class, 'show']);

    // Update / Delete (owner or admin; basic lock rule inside controller)
    Route::put('/planners/{id}', [PlannerController::class, 'update']);
    Route::delete('/planners/{id}', [PlannerController::class, 'destroy']);

    // Items (owner or admin)
    Route::get('/planners/{id}/items', [PlannerController::class, 'itemsIndex']);
    Route::post('/planners/{id}/items', [PlannerController::class, 'itemsStore']);
    Route::put('/planners/{id}/items/{itemId}', [PlannerController::class, 'itemsUpdate']);
    Route::delete('/planners/{id}/items/{itemId}', [PlannerController::class, 'itemsDestroy']);

    // Recalculate totals (returns computed totals; doesn’t change db state except snapshots on items)
    Route::post('/planners/{id}/recalculate', [PlannerController::class, 'recalculate']);
});