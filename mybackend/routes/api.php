<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [AuthController::class, 'register']);
Route::middleware('api')->post('refresh', [AuthController::class, 'refresh']);

Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    // Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);

});

// RUTAS PÚBLICAS DE PETICIONES
Route::get('petitions', [PetitionController::class, 'index']); // Listar todas
Route::get('petitions/{id}', [PetitionController::class, 'show']); // Ver una

// RUTAS PROTEGIDAS DE PETICIONES (auth:api)
Route::middleware('auth:api')->group(function () {
    Route::post('petitions', [PetitionController::class, 'store']); // Crear
    Route::get('mypetitions', [PetitionController::class, 'listMine']); // Mis peticiones
    Route::put('petitions/{id}', [PetitionController::class, 'update']); // Editar
    Route::delete('petitions/{id}', [PetitionController::class, 'destroy']); // Borrar

    Route::put('petitions/sign/{id}', [PetitionController::class, 'sign']);
    // Ruta para cambiar estado (admin)
    Route::put('petitions/status/{id}', [PetitionController::class, 'changeStatus']);
});
