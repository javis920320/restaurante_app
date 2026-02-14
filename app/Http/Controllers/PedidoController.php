<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CrearPedidoQRRequest;
use App\Http\Requests\CambiarEstadoPedidoRequest;
use App\Models\Pedido;
use App\Services\PedidoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PedidoController extends Controller
{
    protected PedidoService $pedidoService;

    public function __construct(PedidoService $pedidoService)
    {
        $this->pedidoService = $pedidoService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Pedido::class);

        $query = Pedido::with(['mesa', 'detalles.producto', 'cliente'])
            ->orderBy('created_at', 'desc');

        // Filtros opcionales
        if ($request->filled('estado')) {
            $query->porEstado($request->estado);
        }

        if ($request->filled('mesa_id')) {
            $query->where('mesa_id', $request->mesa_id);
        }

        $pedidos = $query->paginate(20);

        return Inertia::render('Pedidos/Index', [
            'pedidos' => $pedidos,
            'filters' => $request->only(['estado', 'mesa_id']),
        ]);
    }

    /**
     * Store a newly created resource in storage (desde QR).
     */
    public function store(CrearPedidoQRRequest $request)
    {
        try {
            $pedido = $this->pedidoService->crearPedidoDesdeQR(
                qrToken: $request->qr_token,
                items: $request->items,
                clienteId: $request->cliente_id,
                notas: $request->notas
            );

            return response()->json([
                'message' => 'Pedido creado exitosamente.',
                'pedido' => $pedido,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el pedido.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Pedido $pedido)
    {
        $this->authorize('view', $pedido);

        $pedido->load(['mesa', 'detalles.producto', 'cliente', 'user']);

        return Inertia::render('Pedidos/Show', [
            'pedido' => $pedido,
        ]);
    }

    /**
     * Update the order status.
     */
    public function cambiarEstado(CambiarEstadoPedidoRequest $request, Pedido $pedido)
    {
        $this->authorize('cambiarEstado', $pedido);

        try {
            $pedidoActualizado = $this->pedidoService->cambiarEstado(
                pedido: $pedido,
                nuevoEstado: $request->estado,
                userId: Auth::id()
            );

            return response()->json([
                'message' => 'Estado actualizado exitosamente.',
                'pedido' => $pedidoActualizado,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cambiar el estado.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Close the table (mark order as paid and free the table).
     */
    public function cerrarMesa(Pedido $pedido)
    {
        $this->authorize('update', $pedido);

        try {
            $pedidoCerrado = $this->pedidoService->cerrarMesa(
                pedido: $pedido,
                userId: Auth::id()
            );

            return response()->json([
                'message' => 'Mesa cerrada exitosamente.',
                'pedido' => $pedidoCerrado,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cerrar la mesa.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}

