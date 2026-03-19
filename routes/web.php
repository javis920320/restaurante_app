<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPublicoController;
use App\Http\Controllers\MenuQRController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\OpcionController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PlatoController;
use App\Http\Controllers\RestauranteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Ruta pública del menú QR
Route::get('/menu/{token}', [MenuQRController::class, 'show'])->name('menu.qr');

// Ruta pública del menú digital por slug
Route::get('/menu-publico/{slug}', [MenuPublicoController::class, 'show'])->name('menu.publico');

// Ruta pública para ver el estado del pedido
Route::get('/pedido/{pedido}', [PedidoController::class, 'showStatus'])->name('pedido.status');

// Rutas protegidas con autenticación
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard administrativo
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Panel de Cocina (KDS)
    Route::get('/cocina', [DashboardController::class, 'cocina'])->name('cocina.index');

    // Reportes y Analítica
    Route::get('/reportes', [DashboardController::class, 'reportesPage'])->name('reportes.index');

    // Gestión de pedidos
    Route::get('/pedidos', [PedidoController::class, 'index'])->name('pedidos.index');
    Route::get('/pedidos/crear', [PedidoController::class, 'create'])->name('pedidos.create');
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show'])->name('pedidos.show');

    // Gestión de categorías
    Route::resource('categorias', CategoriaController::class);
    Route::post('/categorias/{categoria}/toggle-activo', [CategoriaController::class, 'toggleActivo'])
        ->name('categorias.toggle-activo');

    // Gestión de productos/platos
    Route::resource('/configuracion/platos', PlatoController::class);
    Route::post('/configuracion/platos/{plato}/toggle-activo', [PlatoController::class, 'toggleActivo'])
        ->name('platos.toggle-activo');
    Route::post('/configuracion/platos/{plato}/toggle-disponible', [PlatoController::class, 'toggleDisponible'])
        ->name('platos.toggle-disponible');

    // Gestión de opciones de platos
    Route::post('/configuracion/platos/{plato}/opciones', [OpcionController::class, 'store'])
        ->name('platos.opciones.store');
    Route::patch('/configuracion/platos/{plato}/opciones/{opcion}', [OpcionController::class, 'update'])
        ->name('platos.opciones.update');
    Route::delete('/configuracion/platos/{plato}/opciones/{opcion}', [OpcionController::class, 'destroy'])
        ->name('platos.opciones.destroy');

    // Gestión de restaurantes
    Route::resource('configuracion/restaurantes', RestauranteController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('restaurantes');

    // Gestión de menús digitales
    Route::get('/configuracion/menus', [MenuController::class, 'index'])->name('menus.index');
    Route::post('/configuracion/menus', [MenuController::class, 'store'])->name('menus.store');
    Route::get('/configuracion/menus/{menu}', [MenuController::class, 'show'])->name('menus.show');
    Route::put('/configuracion/menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
    Route::delete('/configuracion/menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');
    Route::post('/configuracion/menus/{menu}/toggle-estado', [MenuController::class, 'toggleEstado'])->name('menus.toggle-estado');
    Route::get('/configuracion/menus/{menu}/qr', [MenuController::class, 'generarQR'])->name('menus.generar-qr');

    // Gestión de mesas
    Route::resource('/configuracion/mesas', MesaController::class);
    Route::get('/configuracion/mesas/{mesa}/qr', [MesaController::class, 'generarQR'])
        ->name('mesas.generar-qr');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
