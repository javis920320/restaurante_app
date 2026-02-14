# Frontend Architecture Documentation

## Overview
This document describes the frontend architecture implemented for the Restaurant/Gastrobar QR ordering system.

## Technology Stack
- **React 19** with TypeScript
- **Inertia.js** for seamless Laravel-React integration
- **TailwindCSS** for styling
- **Axios** for API requests
- **Context API** for state management

## Project Structure

```
resources/js/
├── components/
│   ├── MenuQR/          # Public menu components
│   │   ├── CategorySection.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CarritoSidebar.tsx
│   │   └── CarritoItem.tsx
│   ├── Pedidos/         # Order management components
│   │   ├── PedidoCard.tsx
│   │   ├── EstadoBadge.tsx
│   │   └── EstadoSelector.tsx
│   └── ui/              # Reusable UI components
├── context/
│   └── CarritoContext.tsx    # Shopping cart state management
├── hooks/
│   ├── usePedido.ts          # Order tracking with 10s polling
│   └── useAdminPedidos.ts    # Admin orders with 30s polling
├── pages/
│   ├── MenuQR/
│   │   ├── Show.tsx          # Public menu view
│   │   └── Error.tsx         # Invalid QR error
│   └── Pedidos/
│       ├── Index.tsx         # Admin dashboard
│       ├── Show.tsx          # Order details
│       └── Status.tsx        # Public order status
├── services/
│   ├── api.ts               # Axios configuration
│   ├── menuService.ts       # Menu API calls
│   ├── pedidoService.ts     # Order API calls
│   └── adminService.ts      # Admin API calls
└── layouts/
    └── app-layout.tsx       # Main application layout
```

## Key Features

### Public Customer Flow
1. **QR Code Scanning**: Customers scan QR → `/menu/{token}`
2. **Menu Display**: Products grouped by category
3. **Shopping Cart**: Add/remove/update quantities
4. **Order Creation**: Submit order via API
5. **Status Tracking**: Real-time order status with 10-second polling

### Admin Panel
1. **Dashboard**: View all orders with filters
2. **Status Management**: Change order status
3. **Real-time Updates**: 30-second polling for automatic refresh
4. **Order Details**: View complete order information

## State Management

### CarritoContext
Manages shopping cart state using React Context API:
- Add/remove products
- Update quantities
- Calculate totals (client-side for display only)
- Clear cart

### Custom Hooks

#### usePedido(codigo)
- Fetches order by ID
- Implements 10-second polling
- Returns: pedido, loading, error, refetch

#### useAdminPedidos(filters)
- Fetches paginated orders
- Implements 30-second polling
- Supports filtering by status and table
- Returns: pedidos, loading, error, cambiarEstado, cerrarMesa

## API Services

### api.ts
Base Axios configuration with:
- CSRF token handling
- Request/response interceptors
- Error handling (401, 403, 422, 500)

### pedidoService.ts
- `crearPedido()`: Create new order
- `obtenerPedidoPorCodigo()`: Get order by ID

### adminService.ts
- `obtenerPedidos()`: List orders with filters
- `cambiarEstadoPedido()`: Update order status
- `cerrarMesa()`: Mark order as paid and free table

## Security Considerations

1. **Token Validation**: All tokens validated server-side
2. **Price Calculation**: All prices calculated on backend
3. **State Protection**: Prevent modification of paid/cancelled orders
4. **Error Handling**: Proper error messages without exposing sensitive data
5. **No Business Logic**: Frontend only handles UI and API calls

## Real-time Updates

### Order Status Polling
- Public view: 10-second intervals
- Admin view: 30-second intervals
- Automatic cleanup on component unmount

### Future: WebSockets
The architecture is prepared for WebSocket integration:
- Backend events already implement `ShouldBroadcast`
- Frontend can easily be updated to use WebSocket libraries

## Type Safety

All components and services use TypeScript interfaces:
- `Producto`, `Categoria`, `Mesa`
- `Pedido`, `PedidoDetalle`
- `CarritoItem`
- API response types

## Styling

- **TailwindCSS** for utility-first styling
- **shadcn/ui** components for consistent UI
- **Responsive design** for mobile and desktop
- **Loading states** with skeleton components
- **Empty states** for better UX

## Best Practices

1. **Minimal Business Logic**: All calculations done server-side
2. **Error Boundaries**: Proper error handling at all levels
3. **Loading States**: Visual feedback for async operations
4. **Path Aliases**: Using `@/` for clean imports
5. **Code Splitting**: Lazy loading for better performance
6. **TypeScript**: Full type safety across the application

## Development

### Build
```bash
npm run build
```

### Format
```bash
npm run format
```

### Lint
```bash
npm run lint
```

### Type Check
```bash
npm run types
```
