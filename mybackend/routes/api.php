<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [AuthController::class, 'register']);

Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
     Route::post('refresh', [AuthController::class, 'refresh']);
});

// RUTAS PÚBLICAS DE PETICIONES
Route::get('petitions', [PetitionController::class, 'index']); // Listar todas
Route::get('petitions/{id}', [PetitionController::class, 'show']); // Ver detalle

Route::get('categories', [CategoryController::class, 'index']);

// RUTAS PROTEGIDAS DE PETICIONES (auth:api)
Route::middleware('auth:api')->group(function () {

    // Crear (POST)
    Route::post('petitions', [PetitionController::class, 'store']);

    // Actualizar (PUT) - Laravel detecta el _method: PUT que envía Angular
    Route::put('petitions/{id}', [PetitionController::class, 'update']);

    // Borrar (DELETE)
    Route::delete('petitions/{id}', [PetitionController::class, 'destroy']);

    // Firmar (POST) - Importante: Cambiado a POST para coincidir con el PDF y Angular
    Route::post('petitions/sign/{id}', [PetitionController::class, 'sign']);

});
