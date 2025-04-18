<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\PlatoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::resource("categorias", CategoriaController::class);//->middleware(['auth', 'verified']);
Route::resource("/configuracion/platos",PlatoController::class);
Route::resource("/configuracion/mesas",MesaController::class);  
//Route::resource("/configuracion/usuarios",);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
