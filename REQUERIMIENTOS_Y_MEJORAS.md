# Análisis de Requerimientos y Mejoras - Restaurante App

**Fecha de análisis:** Mayo 2026  
**Versión actual:** Laravel 12, React 19, TypeScript  
**Estado:** Implementación inicial completada, pronto a producción

---

## 📊 RESUMEN EJECUTIVO

Tu proyecto cuenta con una arquitectura moderna y robusta. He identificado **12 requerimientos críticos** y **8 mejoras importantes** que deberían implementarse para pasar a producción y escalar eficientemente.

| Categoría | Críticas | Importantes | Optimizaciones |
|-----------|----------|-------------|-----------------|
| Infraestructura | 3 | 2 | 2 |
| Seguridad | 2 | 2 | 1 |
| Observabilidad | 2 | 3 | 2 |
| Funcionalidad | 3 | 1 | 3 |
| Testing | 2 | - | - |

---

## 🔴 REQUERIMIENTOS CRÍTICOS (ALTO RIESGO)

### 1. **Gestión de Sesiones en Producción**
**Estado:** ⚠️ No implementado
**Impacto:** CRÍTICO

```env
# Actual (development)
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

**Problema:** Usar base de datos para sesiones, caché y colas causa:
- Contención de conexiones
- Performance degradada con muchos usuarios
- Pérdida de datos en reinicio

**Requerimiento:**
```env
# Producción recomendado
SESSION_DRIVER=cookie         # O Redis
CACHE_STORE=redis            # Múltiples stores
QUEUE_CONNECTION=redis       # O database para baja concurrencia
```

**Acciones a ejecutar:**
- [ ] Configurar Redis (local o cloud)
- [ ] Implementar cache drivers separados para session/general/jobs
- [ ] Actualizar `.env.production`
- [ ] Scripts de migración de datos

---

### 2. **Autenticación y Autorización Incompleta**
**Estado:** ⚠️ Parcialmente implementado
**Impacto:** CRÍTICO

**Hallazgos:**
- ✅ Role-based access control (RBAC) con Spatie implementado
- ✅ Sanctum para API tokens
- ❌ No hay rate limiting en endpoints públicos
- ❌ No hay 2FA (autenticación de dos factores)
- ❌ No hay gestión de tokens expirados
- ❌ No hay auditoría de acceso

**Requerimiento:**
```php
// app/Http/Middleware/ThrottleRequests.php
// Implementar rate limiting por endpoint:
- Login: 5 intentos / 15 minutos
- API público (pedidos): 30 requests / minuto por IP
- API privado: 100 requests / minuto por usuario
```

**Acciones a ejecutar:**
- [ ] Implementar middleware de rate limiting
- [ ] Agregar Laravel Passport o similar para 2FA
- [ ] Crear tabla de auditoría (audit_logs)
- [ ] Implementar token refresh automático

---

### 3. **Validación y Sanitización Incompleta**
**Estado:** ⚠️ Parcialmente implementado
**Impacto:** ALTO

**Hallazgos:**
- ✅ Form Requests básicas creadas
- ❌ No hay validación de precios (XSS/manipulación)
- ❌ No hay sanitización de entrada de usuario
- ❌ No hay validación de archivos (si hubiera uploads)

**Problema crítico:** El sistema confía en cálculos de frontend para precios:
```typescript
// RIESGO: El frontend podría enviar precios modificados
const totalCarrito = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
```

**Requerimiento:**
```php
// app/Http/Requests/CrearPedidoQRRequest.php
public function rules(): array {
    return [
        'mesa_token' => 'required|uuid|exists:mesas,qr_token',
        'items' => 'required|array|min:1',
        'items.*.plato_id' => 'required|integer|exists:platos,id,activo,1',
        'items.*.cantidad' => 'required|integer|min:1|max:100',
        'items.*.precio_unitario' => 'required|numeric|min:0.01',
        // ⚠️ Validar que precio coincida con BD:
        'cliente_nombre' => 'nullable|string|max:255|regex:/^[a-zA-Z\s]+$/',
        'cliente_telefono' => 'nullable|regex:/^[0-9\-\+]+$/',
    ];
}

protected function prepareForValidation(): void {
    // Rechazar si precio no coincide con BD
    foreach ($this->items as $item) {
        $plato = Plato::findOrFail($item['plato_id']);
        if ($plato->precio != $item['precio_unitario']) {
            throw ValidationException::withMessages([
                'items' => 'Precio modificado detectado. Intento bloqueado.'
            ]);
        }
    }
}
```

**Acciones a ejecutar:**
- [ ] Crear FormRequest mejoradas con validación de precios
- [ ] Implementar sanitización con HTMLPurifier
- [ ] Crear rules personalizadas para validaciones complejas
- [ ] Implementar escaneado de seguridad en CI/CD (SonarQube)

---

### 4. **Sistema de Pagos Incompleto**
**Estado:** ⚠️ Mock solo (no integrado a proveedores reales)
**Impacto:** CRÍTICO

**Hallazgos:**
- ✅ Estructura PaymentService creada
- ❌ No hay integración con Stripe/PayPal/MercadoPago
- ❌ No hay webhooks de confirmación
- ❌ No hay manejo de reembolsos
- ❌ No hay PCI-DSS compliance

**Requerimiento:**
```php
// app/Services/PaymentService.php
// Debe soportar múltiples proveedores:

interface PaymentProviderInterface {
    public function createPaymentIntent(Pedido $pedido): PaymentIntent;
    public function confirmPayment(string $paymentId): bool;
    public function refund(Payment $payment, float $amount): bool;
    public function handleWebhook(array $data): void;
}

// Implementaciones:
- StripePaymentProvider
- MercadoPagoProvider
- PayPalProvider
- CashPaymentProvider (manual/presencial)
```

**Acciones a ejecutar:**
- [ ] Seleccionar proveedor de pagos (Stripe recomendado)
- [ ] Integrar SDK oficial
- [ ] Implementar webhook listeners
- [ ] Crear tabla Payment con campos: `provider`, `transaction_id`, `webhook_verified`
- [ ] Implementar PCI-DSS compliance

---

### 5. **Documentación de API Incompleta**
**Estado:** ⚠️ Parcial (falta swagger/OpenAPI)
**Impacto:** ALTO

**Problema:**
- ✅ Documentación en Markdown (.md)
- ❌ No hay Swagger/OpenAPI
- ❌ No hay documentación autogenerada

**Requerimiento:**
```php
// Usar Laravel OpenAPI / Swagger
composer require darkaonline/l5-swagger

// Anotar controladores con atributos PHP 8
#[OA\Get(
    path: "/api/pedidos/{pedido}",
    summary: "Get order details",
    tags: ["Pedidos"]
)]
public function show(Pedido $pedido): JsonResponse
```

**Acciones a ejecutar:**
- [ ] Instalar L5-Swagger
- [ ] Anotar todos los endpoints
- [ ] Generar Swagger UI en `/api/docs`
- [ ] Integrar en CI/CD

---

### 6. **Manejo de Errores y Logging Incompleto**
**Estado:** ⚠️ Básico
**Impacto:** ALTO

**Hallazgos:**
- ✅ Logging básico a archivos
- ❌ No hay centralización de logs (ELK, Datadog)
- ❌ No hay error tracking (Sentry)
- ❌ No hay context en logs
- ❌ No hay alertas en producción

**Requerimiento:**
```php
// config/logging.php - Agregar canales
'channels' => [
    'single' => [...], // archivo
    'sentry' => [...], // error tracking
    'datadog' => [...], // observabilidad
    'slack' => [...], // alertas críticas
],

// Uso en código:
Log::emergency('Payment failed for order ' . $pedido->id, [
    'pedido_id' => $pedido->id,
    'usuario_id' => Auth::id(),
    'error_code' => $exception->getCode(),
    'trace' => $exception->getTraceAsString(),
]);

// En excepciones
throw new PaymentException(
    "Pago rechazado: {$response->message}",
    $response->code,
    context: ['pedido_id' => $pedido->id]
);
```

**Acciones a ejecutar:**
- [ ] Integrar Sentry para error tracking
- [ ] Configurar logging por severidad
- [ ] Agregar context a todos los logs
- [ ] Crear alertas Slack para errores críticos
- [ ] Dashboard Datadog/New Relic

---

## 🟠 REQUERIMIENTOS IMPORTANTES (RIESGO MEDIO)

### 7. **Testing Inadecuado**
**Estado:** ❌ No hay tests (solo estructura)
**Impacto:** ALTO

```bash
# Tests descubiertos:
- 0 Feature tests
- 0 Unit tests
- 0 Integration tests
```

**Requerimiento:** Coverage > 70%

```php
// tests/Feature/OrderTest.php
#[Test]
public function can_create_order_via_qr(): void {
    $mesa = Mesa::factory()->create();
    
    $response = $this->postJson('/api/pedidos', [
        'mesa_token' => $mesa->qr_token,
        'items' => [...],
    ]);
    
    $response->assertCreated();
    $this->assertDatabaseHas('pedidos', ['mesa_id' => $mesa->id]);
}
```

**Acciones a ejecutar:**
- [ ] Crear suite de tests Feature (>50 tests)
- [ ] Crear tests Unit para Services (>30 tests)
- [ ] Crear tests de integración (BD)
- [ ] Setup CodeCoverage con CI/CD

---

### 8. **Database Migrations y Schema Incompletos**
**Estado:** ⚠️ Estructura básica solo
**Impacto:** MEDIO-ALTO

**Falta:**
- Índices en columnas de búsqueda
- Constraints de integridad referencial
- Políticas de soft delete inconsistentes
- No hay columnas de auditoría

**Requerimiento:**
```php
// database/migrations/2024_xx_xx_create_pedidos_table.php
Schema::create('pedidos', function (Blueprint $table) {
    $table->id();
    // ... columnas
    $table->timestamps();
    $table->softDeletes();
    
    // Índices de búsqueda
    $table->index('numero_pedido');
    $table->index('mesa_id');
    $table->index('estado');
    $table->index(['restaurante_id', 'created_at']);
    
    // Auditoría
    $table->string('created_by')->nullable();
    $table->string('updated_by')->nullable();
    
    // Foreign keys con cascade
    $table->foreignId('mesa_id')->constrained('mesas')
        ->onDelete('cascade');
});
```

**Acciones a ejecutar:**
- [ ] Revisar todas las migrations
- [ ] Agregar índices faltantes
- [ ] Implementar full-text search en productos
- [ ] Agregar columnas de auditoría
- [ ] Crear seed factories realistas

---

### 9. **Frontend: Gestión de Estado Incompleta**
**Estado:** ⚠️ Context API básico
**Impacto:** MEDIO

**Hallazgos:**
- ✅ Context API para carrito
- ❌ No hay estado global de app (usuario, tema, notificaciones)
- ❌ No hay caché persistente
- ❌ No hay rehydratación en navegador
- ❌ No hay optimistic updates

**Requerimiento:**
```typescript
// Opción 1: TanStack Query + Zustand (recomendado moderno)
// Opción 2: Redux Toolkit (si escala mucho)

// hooks/useAppStore.ts
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
  isOnline: boolean;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  theme: 'light',
  notifications: [],
  isOnline: navigator.onLine,
  
  setUser: (user) => set({ user }),
  addNotification: (notif) => set((state) => ({
    notifications: [...state.notifications, notif]
  })),
}));

// Persistencia
const persistStore = useAppStore.persist({
  name: 'app-store',
  storage: localStorage,
});
```

**Acciones a ejecutar:**
- [ ] Evaluar TanStack Query vs Redux
- [ ] Implementar estado global
- [ ] Agregar persistencia en localStorage
- [ ] Crear hooks reutilizables
- [ ] Implementar error boundaries

---

### 10. **WebSocket / Real-time Ausente**
**Estado:** ❌ No implementado (polling actual)
**Impacto:** MEDIO

**Problema:** Sistema usa polling (10-15s) en lugar de WebSockets:
```typescript
// Actual (ineficiente en producción)
setInterval(() => fetchMetrics(), 10000); // Cada 10s
```

**Requerimiento:**
```php
// Laravel Broadcasting con Pusher/Ably
// config/broadcasting.php
'pusher' => [
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'useTLS' => true,
    ],
],

// app/Events/PedidoEstadoActualizado.php (ya existe)
public function broadcastOn(): array {
    return [
        new PrivateChannel("user.{$this->pedido->user_id}"),
        new Channel("mesas.{$this->pedido->mesa_id}"),
    ];
}

// Frontend
import Echo from "laravel-echo";
echo.channel(`mesas.${mesaId}`).listen('PedidoEstadoActualizado', (event) => {
    setPedido(event.pedido);
});
```

**Acciones a ejecutar:**
- [ ] Elegir proveedor: Pusher, Ably o socket.io local
- [ ] Configurar Broadcasting
- [ ] Crear eventos para cambios de estado
- [ ] Implementar listeners en frontend (React)
- [ ] Quitar polling innecesario

---

### 11. **Deployment y CI/CD Ausente**
**Estado:** ❌ No implementado
**Impacto:** CRÍTICO

**Requerimiento:**
```yaml
# .github/workflows/deploy.yml (ejemplo)
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: composer test
      - name: Run Psalm
        run: ./vendor/bin/psalm

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          rsync -avz ./ ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:/var/www/app/
          ssh ${{ secrets.DEPLOY_HOST }} 'cd /var/www/app && php artisan migrate:fresh --force'
```

**Acciones a ejecutar:**
- [ ] Configurar GitHub Actions / GitLab CI
- [ ] Crear stages: Test → Build → Deploy
- [ ] Implementar testing automatizado
- [ ] Crear script de rollback
- [ ] Documentar estrategia de deploy

---

### 12. **Dockerización Incompleta**
**Estado:** ⚠️ docker-compose.yml existe pero sin optimización
**Impacto:** MEDIO

**Problemas:**
- ❌ Sin health checks
- ❌ Sin optimización de imágenes
- ❌ Sin multi-stage build
- ❌ Credenciales hardcodeadas

**Requerimiento:**
```dockerfile
# Dockerfile.production
FROM php:8.3-fpm-alpine AS build

WORKDIR /var/www

# Copiar y instalar dependencias
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

FROM php:8.3-fpm-alpine

WORKDIR /var/www
COPY --from=build /var/www /var/www
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php -r "exit((int)!(file_exists('/tmp/health'))); " || exit 1

CMD ["php-fpm"]
```

**Acciones a ejecutar:**
- [ ] Crear multi-stage Dockerfile
- [ ] Agregar health checks
- [ ] Optimizar tamaño de imagen
- [ ] Usar .dockerignore
- [ ] Agregar secrets management

---

## 💚 MEJORAS IMPORTANTES (RIESGO BAJO)

### 13. **Caché de Productos**
```php
// app/Models/Plato.php
public static function obtenerActivos() {
    return Cache::remember('platos.activos', now()->addHours(1), function () {
        return static::where('activo', true)->get();
    });
}
```

**Acción:** [ ] Implementar Redis cache para productos

---

### 14. **Paginación y Búsqueda Avanzada**
```php
// app/Http/Controllers/PlatoController.php
public function index(Request $request) {
    $query = Plato::query()
        ->whereFullText(['nombre', 'descripcion'], $request->search)
        ->where('activo', true)
        ->paginate(20);
}
```

**Acción:** [ ] Agregar búsqueda full-text

---

### 15. **Email Notifications**
```php
// app/Notifications/PedidoConfirmado.php
class PedidoConfirmadoNotification extends Notification {
    public function via($notifiable): array {
        return ['mail', 'database'];
    }
}
```

**Acción:** [ ] Configurar Mailable para confirmaciones

---

### 16. **Mobile App Companion**
- [ ] API OAuth2 para mobile
- [ ] Endpoints de sincronización offline-first
- [ ] Soporte para push notifications

---

### 17. **Analytics y Reportes**
```php
// app/Services/AnalyticsService.php
- Reportes diarios/semanales/mensuales
- KPIs: ticket promedio, products populares, horarios pico
- Export a Excel/PDF
```

**Acción:** [ ] Integrar Spatie Query Builder para reports

---

### 18. **Gestión de Inventario**
```php
// Modelos faltantes:
- Stock (cantidad disponible)
- StockMovement (auditoría)
- Alerts para bajo stock
```

**Acción:** [ ] Crear módulo de inventario

---

### 19. **Multi-Restaurante Full Support**
- [ ] Revisar si todos los endpoints filtran por `restaurante_id`
- [ ] Agregar políticas de acceso

---

### 20. **Dark Mode y Accesibilidad**
```typescript
// Implementado parcialmente, mejorar:
- [ ] WCAG 2.1 AA compliance
- [ ] Aria labels
- [ ] Contrast ratios
```

---

## 📋 TABLA DE PRIORIZACIÓN

| # | Requerimiento | Crítica | Complejidad | Esfuerzo | Prioridad |
|---|--------------|---------|-------------|----------|-----------|
| 1 | Redis/Sesiones | Sí | Media | 2-3 días | 🔴 P1 |
| 2 | 2FA + Rate Limit | Sí | Media | 3-4 días | 🔴 P1 |
| 3 | Validación Precios | Sí | Baja | 1 día | 🔴 P1 |
| 4 | Payment Integration | Sí | Alta | 5-7 días | 🔴 P1 |
| 5 | Swagger/OpenAPI | No | Media | 2 días | 🟠 P2 |
| 6 | Error Tracking | No | Media | 2-3 días | 🟠 P2 |
| 7 | Tests | Sí | Alta | 8-10 días | 🟠 P2 |
| 8 | DB Optimization | No | Media | 3-4 días | 🟠 P2 |
| 9 | Frontend State | No | Media | 3-4 días | 🟠 P2 |
| 10 | WebSockets | No | Alta | 4-5 días | 🟠 P2 |
| 11 | CI/CD | No | Media | 3-4 días | 🟠 P2 |
| 12 | Docker Optimize | No | Baja | 1-2 días | 🟢 P3 |

---

## 🚀 PLAN DE ACCIÓN (PRÓXIMAS SEMANAS)

### Semana 1: Seguridad y Base Sólida
- [ ] Implementar Redis y actualizar drivers
- [ ] Agregar rate limiting
- [ ] Validar precios en backend
- [ ] Setup Sentry para error tracking

### Semana 2: Testing y Calidad
- [ ] Crear suite de tests (primero API crítica)
- [ ] Setup CI/CD con GitHub Actions
- [ ] Configurar SonarQube

### Semana 3: Funcionalidad de Pago
- [ ] Integración Stripe/MercadoPago
- [ ] Webhooks
- [ ] Testing de pagos

### Semana 4: Frontend y Real-time
- [ ] Mejorar gestión de estado
- [ ] WebSockets (broadcasting)
- [ ] Optimistic updates

---

## ✅ CHECKLIST PRE-PRODUCCIÓN

- [ ] Security audit completado
- [ ] HTTPS/TLS configurado
- [ ] Rate limiting activado
- [ ] 2FA implementado
- [ ] Backups automatizados
- [ ] CDN para assets estáticos
- [ ] Monitoring en vivo
- [ ] Logs centralizados
- [ ] Alert system configurado
- [ ] Disaster recovery plan
- [ ] Load testing completado
- [ ] Tests >70% coverage
- [ ] Code review process
- [ ] Documentación completa

---

## 📚 RECURSOS RECOMENDADOS

### Seguridad
- OWASP Top 10
- Laravel Security Handbook
- PHP: The Right Way

### Testing
- Pest PHP docs
- Martin Fowler - Test Strategies

### Performance
- Laravel Performance Optimization
- Database Indexing Guide

### DevOps
- GitHub Actions Documentation
- Docker Best Practices

---

**Próximos pasos:**
1. Revisar este documento en equipo
2. Priorizar según presupuesto/timeline
3. Crear issues en GitHub con estos requerimientos
4. Asignar velocidad de desarrollo
5. Revisar cada 2 semanas
