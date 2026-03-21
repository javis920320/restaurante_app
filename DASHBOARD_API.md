# Dashboard API Documentation

## Overview
This document describes the Dashboard API endpoints for real-time monitoring of the restaurant system.  
The system uses a **Dual State Model**: operational state (`Pedido.estado`) and payment state (`Pedido.payment_status`) are managed independently.

## Authentication
All dashboard endpoints require authentication using Laravel Sanctum or session-based auth.

---

## Dual State System

### Operational State (`Pedido.estado`)
Represents the **production/kitchen flow**. Allowed values:

| Value | Description |
|-------|-------------|
| `pendiente` | Order received, waiting confirmation |
| `confirmado` | Confirmed by staff |
| `en_preparacion` | Kitchen/bar actively preparing |
| `listo` | Ready to be served |
| `entregado` | Delivered to the table |
| `cancelado` | Cancelled (terminal) |

> ⚠️ `pagado` has been **removed** from the operational state. Use `payment_status` for payment tracking.

### Payment State (`Pedido.payment_status`)
Represents the **financial/cashier flow**. Allowed values:

| Value | Description |
|-------|-------------|
| `pending` | Not yet paid (default) |
| `paid` | Payment confirmed |
| `cancelled` | Payment cancelled |
| `refunded` | Refunded (future use) |

### Business Rule: `require_payment_before_preparation`
Configurable via environment variable:

```env
REQUIRE_PAYMENT_BEFORE_PREPARATION=true  # Default: true (gastrobar mode)
```

When `true`:
- Kitchen and bar **cannot** move items to `en_preparacion` until `payment_status = paid`
- KDS endpoints only return **paid** orders
- Frontend KDS shows a "Pending payment" block on unpaid orders

When `false`:
- Production and payment are fully independent (traditional restaurant mode)

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

> `ventas_dia` and `ticket_promedio` are computed from `payment_status = 'paid'` (not `estado = 'pagado'`).

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
  }
]
```

---

### 3. Get Orders Kanban View
Get orders grouped by operational status for Kanban display.

**Endpoint:** `GET /api/admin/dashboard/pedidos-kanban`

**Response:**
```json
{
  "pendiente": [...],
  "confirmado": [],
  "en_preparacion": [...],
  "listo": [...],
  "entregado": [...]
}
```

---

### 4. Get Quick Reports
Get reports for the current day. Uses `payment_status = 'paid'` for financial metrics.

**Endpoint:** `GET /api/admin/dashboard/reportes`

**Response:**
```json
{
  "ventas_por_hora": [{"hora": 12, "total_pedidos": 15, "total_ventas": 675.50}],
  "productos_mas_vendidos": [{"producto": "Hamburguesa", "cantidad": 45, "ventas": 450.00}],
  "total_pedidos_dia": 87,
  "tiempo_promedio_preparacion": 25
}
```

---

### 5. Kitchen KDS Orders
Returns orders for the kitchen. When `require_payment_before_preparation=true`, only paid orders are returned.

**Endpoint:** `GET /api/admin/cocina/pedidos`

**Response item:**
```json
{
  "id": 1,
  "mesa_nombre": "Mesa 1",
  "estado": "pendiente",
  "payment_status": "paid",
  "tiempo_transcurrido": 12,
  "productos": [...]
}
```

---

### 6. Bar KDS Orders
Returns orders for the bar. Same payment-filter behavior as kitchen KDS.

**Endpoint:** `GET /api/admin/bar/pedidos`

---

### 7. Cashier (Caja) Orders
Returns orders grouped by payment status for the cashier view.

**Endpoint:** `GET /api/admin/caja/pedidos`

**Response:**
```json
{
  "pending": [
    {
      "id": 1,
      "mesa_nombre": "Mesa 3",
      "estado": "entregado",
      "payment_status": "pending",
      "total": 45.50,
      "tiempo_transcurrido": 35,
      "productos_resumen": [{"nombre": "Hamburguesa", "cantidad": 2}]
    }
  ],
  "paid": [...]
}
```

---

### 8. Mark Order as Paid
Mark an order as paid without closing the table (cashier action).

**Endpoint:** `PATCH /api/pedidos/{pedido}/pagar`

**Auth:** Requires `update` permission on the order.

**Response:**
```json
{
  "message": "Pedido marcado como pagado exitosamente.",
  "pedido": { "id": 1, "payment_status": "paid", ... }
}
```

---

### 9. Close Table
Mark order as paid AND release the table.

**Endpoint:** `POST /api/pedidos/{pedido}/cerrar-mesa`

**Response:**
```json
{
  "message": "Mesa cerrada exitosamente.",
  "pedido": { "id": 1, "payment_status": "paid", "estado": "entregado", ... }
}
```

---

### 10. Area Kanban (Kitchen / Bar)
Returns item-level kanban grouped by item status.

**Endpoint:** `GET /api/admin/kanban/{area}` where `area` = `kitchen` or `bar`

---

## State Transitions

### Allowed Operational State Transitions

```
pendiente → confirmado, en_preparacion, cancelado
confirmado → en_preparacion, cancelado
en_preparacion → listo, cancelado
listo → entregado
entregado → cancelado
```

Terminal state: `cancelado`

> Note: `entregado → pagado` transition has been **removed**. Use `PATCH /pedidos/{id}/pagar` instead.

### Payment State Transitions (separate axis)

```
pending → paid      (via /pagar or /cerrar-mesa)
pending → cancelled
```

---

## Frontend Integration

### Custom Hooks

#### useDashboardMetrics
```typescript
const { metrics, loading, error, refetch } = useDashboardMetrics({ pollingInterval: 10 });
```

#### useCajaKDS
```typescript
const { data, loading, error, marcarComoPagado, cerrarMesa, refetch } = useCajaKDS({
  pollingInterval: 15,
  initialData: props.initialPedidos, // SSR initial data
});
// data.pending: unpaid orders
// data.paid: paid orders
```

#### useCocinaKDS / useBarKDS
Both hooks now include `payment_status` in the `PedidoCocina` / `PedidoBar` interface.

---

## Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| `admin` | Full access |
| `cocina` | View/update kitchen orders; respects payment block |
| `bar` | View/update bar orders; respects payment block |
| `mesero` | Create orders, view orders |
| `caja` | Mark orders as paid, close tables |

---

## Performance Considerations

1. **Metrics Caching**: Dashboard metrics are cached for 30 seconds
2. **Eager Loading**: All queries use eager loading to prevent N+1 issues
3. **Polling Intervals**: Metrics: 10s | Tables: 15s | Caja: 15s | Reports: 60s

---

## Error Handling

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

HTTP Status Codes: `200` Success | `401` Unauthorized | `403` Forbidden | `422` Validation/transition error | `500` Server error

