# Dashboard API Documentation

## Overview
This document describes the new Dashboard API endpoints for real-time monitoring of the restaurant system.

## Authentication
All dashboard endpoints require authentication using Laravel Sanctum or session-based auth.

---

## Endpoints

### 1. Get Dashboard Metrics
Get real-time metrics for the dashboard.

**Endpoint:** `GET /api/admin/dashboard/metrics`

**Response:**
```json
{
  "pedidos_pendientes": 5,
  "pedidos_en_preparacion": 12,
  "pedidos_listos": 3,
  "mesas_ocupadas": 8,
  "mesas_libres": 4,
  "ventas_dia": 1250.50,
  "ticket_promedio": 45.75
}
```

**Cache:** Response is cached for 30 seconds.

---

### 2. Get Tables Status
Get the status of all active tables with their accumulated orders.

**Endpoint:** `GET /api/admin/mesas/status`

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Mesa 1",
    "estado": "ocupada",
    "capacidad": 4,
    "pedidos_activos": 2,
    "total_acumulado": 125.50,
    "tiempo_ocupada": 45
  },
  {
    "id": 2,
    "nombre": "Mesa 2",
    "estado": "disponible",
    "capacidad": 6,
    "pedidos_activos": 0,
    "total_acumulado": 0,
    "tiempo_ocupada": null
  }
]
```

---

### 3. Get Orders Kanban View
Get orders grouped by status for Kanban display.

**Endpoint:** `GET /api/admin/dashboard/pedidos-kanban`

**Response:**
```json
{
  "pendiente": [
    {
      "id": 123,
      "codigo": 123,
      "mesa": {
        "id": 1,
        "nombre": "Mesa 1"
      },
      "estado": "pendiente",
      "total": 45.50,
      "created_at": "2024-02-14T19:30:00.000000Z",
      "tiempo_transcurrido": 15,
      "productos_resumen": [
        {
          "nombre": "Hamburguesa",
          "cantidad": 2
        }
      ]
    }
  ],
  "confirmado": [],
  "en_preparacion": [...],
  "listo": [...],
  "entregado": [...]
}
```

---

### 4. Get Quick Reports
Get reports for the current day.

**Endpoint:** `GET /api/admin/dashboard/reportes`

**Response:**
```json
{
  "ventas_por_hora": [
    {
      "hora": 12,
      "total_pedidos": 15,
      "total_ventas": 675.50
    },
    {
      "hora": 13,
      "total_pedidos": 22,
      "total_ventas": 990.25
    }
  ],
  "productos_mas_vendidos": [
    {
      "producto": "Hamburguesa Clásica",
      "cantidad": 45,
      "ventas": 450.00
    },
    {
      "producto": "Pizza Margarita",
      "cantidad": 30,
      "ventas": 360.00
    }
  ],
  "total_pedidos_dia": 87,
  "tiempo_promedio_preparacion": 25
}
```

---

## Frontend Integration

### Custom Hooks

#### useDashboardMetrics
Polls the metrics endpoint every 10 seconds.

```typescript
const { metrics, loading, error, refetch } = useDashboardMetrics({
  pollingInterval: 10,
  enabled: true
});
```

#### useMesasStatus
Polls the tables status endpoint every 15 seconds.

```typescript
const { mesas, loading, error, refetch } = useMesasStatus({
  pollingInterval: 15,
  enabled: true
});
```

#### usePedidosKanban
Polls the orders kanban endpoint every 10 seconds and includes state change functionality.

```typescript
const { pedidos, loading, error, refetch, cambiarEstado } = usePedidosKanban({
  pollingInterval: 10,
  enabled: true
});
```

#### useReportes
Polls the reports endpoint every 60 seconds.

```typescript
const { reportes, loading, error, refetch } = useReportes({
  pollingInterval: 60,
  enabled: true
});
```

---

## State Transitions

### Allowed Order State Transitions

```
pendiente → confirmado, cancelado
confirmado → en_preparacion, cancelado
en_preparacion → listo, cancelado
listo → entregado
entregado → pagado
```

Terminal states: `pagado`, `cancelado`

Attempting an invalid state transition will result in a 422 error.

---

## Role-Based Access Control

### Roles
- **admin**: Full access to all operations
- **cocina**: Can view orders and change their state (up to "listo")
- **mesero**: Can create orders, view orders, and change states
- **caja**: Can view orders, close tables, and mark orders as paid

### Middleware Usage
Routes can be protected with the `role` middleware:

```php
Route::middleware(['auth', 'role:admin,cocina'])->group(function () {
    // Protected routes
});
```

---

## Performance Considerations

1. **Metrics Caching**: Dashboard metrics are cached for 30 seconds to reduce database load
2. **Eager Loading**: All queries use eager loading to prevent N+1 issues
3. **Polling Intervals**: 
   - Metrics: 10 seconds
   - Tables: 15 seconds
   - Reports: 60 seconds
4. **Future Enhancement**: Ready for WebSocket integration for true real-time updates

---

## UI Components

### MetricsCards
Displays 7 key metrics in card format:
- Pedidos Pendientes
- En Preparación
- Pedidos Listos
- Mesas Ocupadas
- Mesas Libres
- Ventas del Día
- Ticket Promedio

### KanbanBoard
5-column Kanban view showing orders by state with drag-and-drop ready structure.

### TablesGrid
Grid display of all tables showing status, occupancy, and accumulated totals.

### QuickReports
Dashboard section showing:
- Sales by hour (bar chart)
- Top 5 products sold
- Total orders for the day
- Average preparation time

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

HTTP Status Codes:
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `422`: Validation error or invalid state transition
- `500`: Server error
