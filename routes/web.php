<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PlatoController;
use App\Models\Categoria;
use App\Models\Mesa;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    //pasar el menu
     $categoria=Categoria::all();   
    return Inertia::render('welcome',["categorias"=>$categoria]);   
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $mesas=Mesa::all();   
        
        return Inertia::render('dashboard',[
            'mesas'=>$mesas,    
        ]);
    })->name('dashboard');
});

Route::resource("/categorias", CategoriaController::class);//->middleware(['auth', 'verified']);
Route::resource("/configuracion/platos",PlatoController::class);
Route::resource("/configuracion/mesas",MesaController::class);  
Route::resource("/registro/pedido",PedidoController::class);
Route::get("/pedido/{mesa}",[PedidoController::class,"create"])->name("pedido.create");
//Route::resource("/configuracion/usuarios",);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
