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
     * Get quick reports
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function reportes()
    {
        $reportes = $this->dashboardService->getReportes();

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
}
