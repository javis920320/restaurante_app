<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuQRController;
use App\Http\Controllers\PedidoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas para el sistema de pedidos por QR
Route::post('/pedidos', [PedidoController::class, 'store'])->name('api.pedidos.store');
Route::get('/pedidos/{pedido}', [PedidoController::class, 'showPublic'])->name('api.pedidos.show-public');

// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard metrics and data
    Route::get('/admin/dashboard/metrics', [DashboardController::class, 'metrics'])->name('api.dashboard.metrics');
    Route::get('/admin/dashboard/reportes', [DashboardController::class, 'reportes'])->name('api.dashboard.reportes');
    Route::get('/admin/dashboard/pedidos-kanban', [DashboardController::class, 'pedidosKanban'])->name('api.dashboard.pedidos-kanban');
    Route::get('/admin/mesas/status', [DashboardController::class, 'mesasStatus'])->name('api.mesas.status');
    
    // Gestión de pedidos
    Route::get('/pedidos', [PedidoController::class, 'index'])->name('api.pedidos.index');
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show'])->name('api.pedidos.show');
    Route::patch('/pedidos/{pedido}/estado', [PedidoController::class, 'cambiarEstado'])->name('api.pedidos.cambiar-estado');
    Route::post('/pedidos/{pedido}/cerrar-mesa', [PedidoController::class, 'cerrarMesa'])->name('api.pedidos.cerrar-mesa');
});
