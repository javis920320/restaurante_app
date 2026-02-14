# Sistema de Pedidos por QR - Documentación Técnica

## Descripción General

Sistema completo de pedidos mediante código QR para restaurantes y gastrobares, implementado con **Laravel 12**, siguiendo los principios de **arquitectura limpia** y con un enfoque robusto en seguridad.

## 🏗️ Arquitectura

### Componentes Principales

```
app/
├── Events/                    # Eventos del sistema
│   ├── PedidoCreado.php
│   └── PedidoEstadoActualizado.php
├── Listeners/                 # Listeners de eventos
│   ├── NotificarPedidoCreado.php
│   └── NotificarCambioEstado.php
├── Http/
│   ├── Controllers/          # Controllers limpios
│   │   ├── MenuQRController.php
│   │   ├── PedidoController.php
│   │   ├── MesaController.php
│   │   └── PlatoController.php
│   └── Requests/            # Validaciones con FormRequest
│       ├── CrearPedidoQRRequest.php
│       ├── CambiarEstadoPedidoRequest.php
│       ├── MesaRequest.php
│       └── ProductoRequest.php
├── Models/                   # Modelos Eloquent
│   ├── Restaurante.php
│   ├── Mesa.php
│   ├── Pedido.php
│   ├── PedidoDetalle.php
│   ├── Plato.php
│   └── Categoria.php
├── Policies/                # Autorización
│   ├── PedidoPolicy.php
│   ├── MesaPolicy.php
│   └── PlatoPolicy.php
└── Services/               # Lógica de negocio
    ├── PedidoService.php
    └── MesaService.php
```

## 🔐 Seguridad del QR

### Características Críticas

1. **Token UUID Único**: Cada mesa tiene un `qr_token` generado con `Str::uuid()`, no se expone el ID de la mesa.
   
2. **Validación Backend**: Todas las peticiones QR se validan en el servidor:
   ```php
   // El token no puede ser adivinado
   // URL: https://midominio.com/menu/{token}
   // Token ejemplo: b7f3a615-ba09-4f7e-9946-96a54e832ffa
   ```

3. **Triple Validación**:
   - Mesa debe existir y estar activa
   - Restaurante debe estar activo
   - Token debe ser válido

4. **Precios Backend-Only**: Los precios se calculan exclusivamente en el servidor:
   ```php
   // En PedidoService::crearPedidoDesdeQR()
   $producto = Plato::activos()->firstOrFail();
   $precioUnitario = $producto->precio; // Obtenido del servidor
   ```

## 📊 Modelo de Base de Datos

### Tablas Principales

#### restaurantes
```sql
- id
- nombre
- direccion
- telefono
- email
- activo (boolean)
- timestamps
- deleted_at (soft delete)
```

#### mesas
```sql
- id
- restaurante_id (FK)
- nombre (unique)
- capacidad
- estado (enum: 'disponible', 'ocupada')
- qr_token (unique, UUID) ← CRÍTICO
- activa (boolean)
- timestamps
- deleted_at
```

#### pedidos
```sql
- id
- cliente_id (FK, nullable)
- user_id (FK, nullable)
- mesa_id (FK)
- estado (enum: 'pendiente', 'confirmado', 'en_preparacion', 
         'listo', 'entregado', 'pagado', 'cancelado')
- subtotal (decimal)
- total (decimal)
- notas (text)
- timestamps
- deleted_at
```

#### pedido_detalles
```sql
- id
- pedido_id (FK)
- producto_id (FK → platos)
- cantidad
- precio_unitario (decimal) ← Capturado al momento del pedido
- subtotal (decimal)
- notas (text)
- timestamps
```

#### platos (productos)
```sql
- id
- restaurante_id (FK)
- categoria_id (FK)
- nombre
- descripcion
- precio (decimal)
- imagen
- activo (boolean)
- timestamps
- deleted_at
```

## 🔄 Flujo del Pedido

### 1. Cliente Escanea QR
```
GET /menu/{token}
↓
MenuQRController::show()
↓
MesaService::validarToken()
↓
Renderiza menú con productos activos
```

### 2. Cliente Crea Pedido
```
POST /api/pedidos
{
  "qr_token": "b7f3a615-ba09-4f7e-9946-96a54e832ffa",
  "items": [
    {"producto_id": 1, "cantidad": 2, "notas": "Sin cebolla"},
    {"producto_id": 3, "cantidad": 1}
  ],
  "notas": "Para llevar"
}
↓
CrearPedidoQRRequest (validación)
↓
PedidoController::store()
↓
PedidoService::crearPedidoDesdeQR()
  - DB::transaction()
  - Validar token
  - Crear pedido
  - Agregar detalles (precios del servidor)
  - Calcular totales
  - Ocupar mesa
  - event(new PedidoCreado($pedido))
↓
Response 201 con pedido creado
```

### 3. Panel Cocina/Bar
```
GET /pedidos (autenticado)
↓
PedidoController::index()
↓
Lista pedidos con filtros por estado
```

### 4. Cambiar Estado
```
PATCH /api/pedidos/{pedido}/estado
{
  "estado": "en_preparacion"
}
↓
CambiarEstadoPedidoRequest (validación)
↓
PedidoController::cambiarEstado()
↓
PedidoPolicy::cambiarEstado() (autorización)
↓
PedidoService::cambiarEstado()
  - DB::transaction()
  - Actualizar estado
  - event(new PedidoEstadoActualizado(...))
↓
Response 200 con pedido actualizado
```

### 5. Cerrar Mesa
```
POST /api/pedidos/{pedido}/cerrar-mesa
↓
PedidoController::cerrarMesa()
↓
PedidoService::cerrarMesa()
  - DB::transaction()
  - Cambiar estado a 'pagado'
  - Liberar mesa (estado → 'disponible')
↓
Response 200
```

## 🔧 Service Layer

### PedidoService

```php
// Crear pedido desde QR
crearPedidoDesdeQR(
    string $qrToken,
    array $items,
    ?int $clienteId,
    ?string $notas
): Pedido

// Cambiar estado del pedido
cambiarEstado(
    Pedido $pedido,
    string $nuevoEstado,
    ?int $userId
): Pedido

// Calcular totales
calcularTotal(Pedido $pedido): array

// Cerrar mesa (marcar como pagado y liberar)
cerrarMesa(Pedido $pedido, int $userId): Pedido
```

### MesaService

```php
// Validar token QR
validarToken(string $token): ?Mesa

// Ocupar mesa
ocuparMesa(Mesa $mesa): bool

// Liberar mesa
liberarMesa(Mesa $mesa): bool

// Obtener menú disponible
obtenerMenuDisponible(Mesa $mesa): array
```

## 📡 Eventos y Listeners

### PedidoCreado
- **Dispara**: Al crear un nuevo pedido
- **Broadcast**: Canales `pedidos` y `mesa.{mesa_id}`
- **Listener**: `NotificarPedidoCreado`
  - Registrar en logs
  - Enviar notificación a cocina
  - Imprimir ticket (futuro)

### PedidoEstadoActualizado
- **Dispara**: Al cambiar estado del pedido
- **Broadcast**: Canales `pedidos`, `mesa.{mesa_id}`, `pedido.{pedido_id}`
- **Listener**: `NotificarCambioEstado`
  - Registrar en logs
  - Notificar según estado (cocina, mesero, caja)
  - Enviar recibo digital (si pagado)

## 🛡️ Autorización (Policies)

### PedidoPolicy
- `viewAny()`: Todos los autenticados
- `view()`: Todos los autenticados
- `create()`: Todos los autenticados
- `update()`: Solo si no está pagado/cancelado
- `cambiarEstado()`: Solo si no está pagado/cancelado
- `delete()`: Solo si está pendiente/confirmado

### MesaPolicy
- `viewAny()`: Todos los autenticados
- `create()`: Todos los autenticados
- `update()`: Todos los autenticados
- `delete()`: Solo si no tiene pedidos activos

### PlatoPolicy
- Todos los métodos habilitados para usuarios autenticados

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/javis920320/restaurante_app.git
cd restaurante_app
```

### 2. Instalar Dependencias
```bash
composer install
npm install
```

### 3. Configurar Entorno
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configurar Base de Datos
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurante_app
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Ejecutar Migraciones
```bash
php artisan migrate
```

### 6. Seed de Datos de Prueba
```bash
php artisan db:seed --class=TestDataSeeder
```

Credenciales de prueba:
- **Email**: admin@restaurante.com
- **Password**: password

### 7. Compilar Assets
```bash
npm run dev
```

### 8. Iniciar Servidor
```bash
php artisan serve
```

## 📱 Uso del Sistema

### Para Clientes (QR)

1. Escanear código QR de la mesa
2. Ver menú disponible
3. Agregar productos al pedido
4. Confirmar pedido
5. Esperar confirmación

### Para Personal del Restaurante

#### Panel de Pedidos
```
/pedidos
```
- Ver todos los pedidos
- Filtrar por estado
- Filtrar por mesa

#### Gestión de Mesas
```
/configuracion/mesas
```
- CRUD de mesas
- Generar códigos QR
- Ver estado actual

#### Gestión de Productos
```
/configuracion/platos
```
- CRUD de productos
- Activar/desactivar productos
- Gestionar categorías

## 🧪 Testing

### Test de Servicios
```bash
php artisan tinker
```

```php
// Obtener una mesa con token
$mesa = App\Models\Mesa::first();
echo $mesa->qr_token;

// Validar token
$mesaService = app(App\Services\MesaService::class);
$mesa = $mesaService->validarToken('b7f3a615-ba09-4f7e-9946-96a54e832ffa');

// Crear pedido desde servicio
$pedidoService = app(App\Services\PedidoService::class);
$pedido = $pedidoService->crearPedidoDesdeQR(
    qrToken: $mesa->qr_token,
    items: [
        ['producto_id' => 1, 'cantidad' => 2],
        ['producto_id' => 3, 'cantidad' => 1]
    ]
);
```

## 🔮 Funcionalidades Futuras (Preparadas)

### WebSockets
Los eventos ya implementan `ShouldBroadcast` y están listos para:
- Actualización en tiempo real de pedidos
- Notificaciones push al personal
- Dashboard en vivo

### Multi-Sucursal
La estructura de la BD ya soporta:
- Múltiples restaurantes
- Productos por restaurante
- Mesas por restaurante

### Impresión Térmica
Los listeners están preparados para:
- Integración con impresoras térmicas
- Impresión automática en cocina
- Tickets de venta

### Control de Inventario
La estructura permite extender:
- Stock de productos
- Alertas de stock bajo
- Historial de consumo

### División de Cuenta
El modelo permite:
- Múltiples formas de pago
- División por porcentaje
- División por items

## 🔒 Consideraciones de Seguridad

1. ✅ **Tokens QR no adivinables**: UUID aleatorios
2. ✅ **Validación backend**: Todos los precios calculados en servidor
3. ✅ **Autorización**: Policies en todos los endpoints
4. ✅ **Validación de entrada**: FormRequests en todas las peticiones
5. ✅ **Transacciones DB**: Garantizan integridad de datos
6. ✅ **Soft Deletes**: Mantiene historial de cambios
7. ✅ **Logs**: Auditoría completa de operaciones

## 📝 Notas de Implementación

### Estados del Pedido
- **pendiente**: Recién creado, esperando confirmación
- **confirmado**: Aceptado por el sistema
- **en_preparacion**: En cocina/bar
- **listo**: Preparado, listo para entregar
- **entregado**: Servido al cliente
- **pagado**: Cuenta cerrada
- **cancelado**: Pedido cancelado

### Transacciones Críticas
Todas las operaciones críticas usan `DB::transaction()`:
- Creación de pedidos
- Cambio de estado
- Cierre de mesa

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es open-source bajo licencia MIT.

## 👥 Créditos

Sistema desarrollado siguiendo los estándares de Laravel 12 y mejores prácticas de arquitectura limpia.
