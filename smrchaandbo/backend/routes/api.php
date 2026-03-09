<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MeController;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [MeController::class, 'show']);
});
