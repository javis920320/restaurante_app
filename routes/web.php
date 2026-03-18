<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuQRController;
use App\Http\Controllers\MesaController;
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
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show'])->name('pedidos.show');

    // Gestión de categorías
    Route::resource('categorias', CategoriaController::class);

    // Gestión de productos/platos
    Route::resource('/configuracion/platos', PlatoController::class);
    Route::post('/configuracion/platos/{plato}/toggle-activo', [PlatoController::class, 'toggleActivo'])
        ->name('platos.toggle-activo');

    // Gestión de restaurantes
    Route::resource('configuracion/restaurantes', RestauranteController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('restaurantes');

    // Gestión de mesas
    Route::resource('/configuracion/mesas', MesaController::class);
    Route::get('/configuracion/mesas/{mesa}/qr', [MesaController::class, 'generarQR'])
        ->name('mesas.generar-qr');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
