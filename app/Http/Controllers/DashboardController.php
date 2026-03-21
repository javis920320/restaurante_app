<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Display the admin dashboard
     */
    public function index()
    {
        $metrics = $this->dashboardService->getMetrics();
        $mesasStatus = $this->dashboardService->getMesasStatus();

        return Inertia::render('Dashboard/Index', [
            'initialMetrics' => $metrics,
            'initialMesasStatus' => $mesasStatus,
        ]);
    }

    /**
     * Display the kitchen display system (KDS) page
     */
    public function cocina()
    {
        return Inertia::render('Cocina/Index', [
            'requirePaymentBeforePreparation' => config('restaurant.require_payment_before_preparation'),
        ]);
    }

    /**
     * Display the bar display system page
     */
    public function bar()
    {
        return Inertia::render('Bar/Index', [
            'requirePaymentBeforePreparation' => config('restaurant.require_payment_before_preparation'),
        ]);
    }

    /**
     * Display the cashier (caja) page
     */
    public function caja()
    {
        $pedidosCaja = $this->dashboardService->getPedidosCaja();

        return Inertia::render('Caja/Index', [
            'initialPedidos' => $pedidosCaja,
        ]);
    }

    /**
     * Display the reports page
     */
    public function reportesPage()
    {
        return Inertia::render('Reportes/Index');
    }

    /**
     * Get orders for the cashier (caja) view grouped by payment_status
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cajaKDS()
    {
        $pedidos = $this->dashboardService->getPedidosCaja();

        return response()->json($pedidos);
    }

    /**
     * Get orders for the kitchen display system (KDS)
     * Returns pending, confirmed and in_preparation orders (kitchen items only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cocinaKDS()
    {
        $pedidos = $this->dashboardService->getPedidosParaCocina();

        return response()->json($pedidos);
    }

    /**
     * Get orders for the bar display system
     * Returns pending, confirmed and in_preparation orders (bar items only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function barKDS()
    {
        $pedidos = $this->dashboardService->getPedidosParaBar();

        return response()->json($pedidos);
    }

    /**
     * Get real-time metrics for the dashboard
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function metrics()
    {
        $metrics = $this->dashboardService->getMetrics();

        return response()->json($metrics);
    }

    /**
     * Get table status
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function mesasStatus()
    {
        $mesasStatus = $this->dashboardService->getMesasStatus();

        return response()->json($mesasStatus);
    }

    /**
     * Get quick reports with optional date range filtering
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reportes(Request $request)
    {
        $fechaInicio = $request->get('fecha_inicio');
        $fechaFin = $request->get('fecha_fin');

        $reportes = $this->dashboardService->getReportes($fechaInicio, $fechaFin);

        return response()->json($reportes);
    }

    /**
     * Get orders grouped by status (Kanban view)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function pedidosKanban()
    {
        $pedidos = $this->dashboardService->getPedidosKanban();

        return response()->json($pedidos);
    }

    /**
     * Get Kanban board data for a production area (kitchen or bar).
     * Returns order-item groups organised by item-level status columns.
     *
     * @param string $area
     * @return \Illuminate\Http\JsonResponse
     */
    public function kanbanPorArea(string $area)
    {
        if (!in_array($area, ['kitchen', 'bar'])) {
            return response()->json(['message' => 'Área no válida. Use "kitchen" o "bar".'], 422);
        }

        $data = $this->dashboardService->getKanbanPorArea($area);

        return response()->json($data);
    }
}
