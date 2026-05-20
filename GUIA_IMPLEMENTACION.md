# 🛠️ GUÍA DE IMPLEMENTACIÓN - Ejemplos de Código

Este documento contiene código listo para implementar los requerimientos críticos identificados.

---

## 1. VALIDACIÓN DE PRECIOS EN BACKEND

### Problema
```javascript
// ❌ VULNERABLE: El cliente envía el precio
const pedido = {
  items: [
    { plato_id: 1, cantidad: 2, precio_unitario: 5.00 } // ← Cliente controla
  ]
};
```

### Solución

**Paso 1: Crear Form Request**

```php
// app/Http/Requests/CrearPedidoQRRequest.php
<?php

namespace App\Http\Requests;

use App\Models\Plato;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class CrearPedidoQRRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Público
    }

    public function rules(): array
    {
        return [
            'mesa_token' => 'required|uuid|exists:mesas,qr_token',
            'items' => 'required|array|min:1|max:100',
            'items.*.plato_id' => 'required|integer|exists:platos,id',
            'items.*.cantidad' => 'required|integer|min:1|max:100',
            'items.*.precio_unitario' => 'required|numeric|min:0.01', // Será ignorado
            'cliente_nombre' => 'nullable|string|max:255|alpha_spaces',
            'cliente_telefono' => 'nullable|regex:/^[\+\d\-\s]+$/',
            'notas' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Debe incluir al menos un producto',
            'items.min' => 'Debe incluir al menos un producto',
            'mesa_token.exists' => 'Código QR inválido',
        ];
    }

    /**
     * Validar que los precios coincidan con BD
     */
    protected function prepareForValidation(): void
    {
        foreach ($this->items ?? [] as $index => $item) {
            $plato = Plato::find($item['plato_id']);
            
            if (!$plato || !$plato->activo) {
                throw ValidationException::withMessages([
                    "items.$index.plato_id" => "Producto no disponible"
                ]);
            }

            // ✅ VALIDACIÓN CRÍTICA: Verificar precio
            if (isset($item['precio_unitario']) && 
                (float)$item['precio_unitario'] !== (float)$plato->precio) {
                
                // Log el intento fraudulento
                \Log::warning('Precio modificado detectado', [
                    'plato_id' => $plato->id,
                    'precio_en_bd' => $plato->precio,
                    'precio_enviado' => $item['precio_unitario'],
                    'ip' => $this->ip(),
                    'timestamp' => now(),
                ]);

                throw ValidationException::withMessages([
                    "items.$index.precio_unitario" => "Precio no coincide. Intento bloqueado."
                ]);
            }
        }
    }
}
```

**Paso 2: Usar en Controller**

```php
// app/Http/Controllers/PedidoController.php
public function store(CrearPedidoQRRequest $request)
{
    // Validación ya pasó con precios verificados
    $validated = $request->validated();
    
    // Ahora es SEGURO obtener precios del cliente (ya validados)
    return response()->json($pedido, 201);
}
```

**Paso 3: Frontend - Ignorar input de precio del usuario**

```typescript
// resources/js/services/pedidoService.ts
export async function crearPedidoQR(carrito: CartItem[]) {
  // ✅ IMPORTANTE: NO enviamos precio desde frontend
  const payload = {
    mesa_token: getMesaToken(),
    items: carrito.map(item => ({
      plato_id: item.id,
      cantidad: item.cantidad,
      // ❌ NO enviamos item.precio
    })),
    cliente_nombre: getClienteName(),
  };

  const response = await api.post('/pedidos', payload);
  return response.data;
}
```

---

## 2. RATE LIMITING

### Paso 1: Crear Middleware Personalizado

```php
// app/Http/Middleware/ThrottleRequests.php
<?php

namespace App\Http\Middleware;

use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Closure;

class CustomThrottleMiddleware
{
    protected RateLimiter $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    public function handle(Request $request, Closure $next)
    {
        // Diferentes límites por endpoint
        if ($request->is('api/pedidos') && $request->isMethod('POST')) {
            // Login: 5 intentos cada 15 minutos
            $key = 'login:' . $request->ip();
            if ($this->limiter->tooManyAttempts($key, 5, 15)) {
                return response()->json([
                    'message' => 'Demasiados intentos. Intente en 15 minutos.',
                    'retry_after' => $this->limiter->availableIn($key)
                ], 429);
            }
            $this->limiter->hit($key, 15 * 60);
        }

        if ($request->is('api/admin/*')) {
            // API privada: 100 req/min por usuario
            $key = 'api:' . (auth()->id() ?? $request->ip());
            if ($this->limiter->tooManyAttempts($key, 100, 1)) {
                return response()->json(['message' => 'Rate limit exceeded'], 429);
            }
            $this->limiter->hit($key, 60);
        }

        return $next($request);
    }
}
```

### Paso 2: Registrar en Routes

```php
// routes/api.php
Route::post('/pedidos', [PedidoController::class, 'store'])
    ->middleware('throttle:30,1'); // 30 req/minuto

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/dashboard/metrics', ...)
        ->middleware('throttle:100,1'); // 100 req/minuto
});
```

---

## 3. REDIS PARA SESIONES Y CACHE

### Paso 1: Instalar y Configurar

```bash
# En server/Docker
apt-get install redis-server
# O docker pull redis:7-alpine

# En .env
CACHE_STORE=redis
SESSION_DRIVER=redis  # O cookie
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Paso 2: Configurar Múltiples Stores

```php
// config/cache.php
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
    'metrics' => [
        'driver' => 'redis',
        'connection' => 'metrics',
        'serialize' => true,
    ],
    'sessions' => [
        'driver' => 'redis',
        'connection' => 'session',
    ],
]

// config/database.php
'redis' => [
    'cache' => [
        'url' => env('REDIS_CACHE_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_CACHE_PORT', 6379),
        'database' => 1,
    ],
    'metrics' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 2,
    ],
    'session' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 3,
    ],
]
```

### Paso 3: Usar en Services

```php
// app/Services/DashboardService.php
class DashboardService
{
    public function getMetrics()
    {
        return Cache::store('metrics')->remember(
            'dashboard.metrics',
            now()->addMinutes(1), // Cache 1 minuto
            fn () => [
                'pedidos_pendientes' => Pedido::where('estado', 'pendiente')->count(),
                'pedidos_en_preparacion' => Pedido::where('estado', 'en_preparacion')->count(),
                // ...
            ]
        );
    }

    public function invalidateMetrics()
    {
        Cache::store('metrics')->forget('dashboard.metrics');
    }
}
```

---

## 4. 2FA (Autenticación de Dos Factores)

### Opción A: Email OTP (Más simple)

```php
// app/Models/User.php
Schema::create('users', function (Blueprint $table) {
    // ... campos existentes
    $table->string('two_factor_code')->nullable();
    $table->dateTime('two_factor_expires_at')->nullable();
    $table->boolean('two_factor_enabled')->default(true);
});
```

**Paso 1: Enviar código 2FA**

```php
// app/Http/Controllers/Auth/LoginController.php
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return back()->withErrors(['email' => 'Credenciales inválidas']);
    }

    $user = Auth::user();

    // Generar código 2FA
    $code = rand(100000, 999999);
    $user->update([
        'two_factor_code' => Hash::make($code),
        'two_factor_expires_at' => now()->addMinutes(10),
    ]);

    // Enviar por email
    Mail::send('emails.otp-code', ['code' => $code], fn($m) => 
        $m->to($user->email)->subject('Tu código de acceso: ' . $code)
    );

    return redirect()->route('auth.verify-2fa');
}

// app/Http/Controllers/Auth/TwoFactorController.php
public function verify(Request $request)
{
    $request->validate(['code' => 'required|numeric|digits:6']);

    $user = Auth::user();

    if ($user->two_factor_expires_at?->isPast()) {
        return back()->withErrors(['code' => 'Código expirado']);
    }

    if (!Hash::check($request->code, $user->two_factor_code)) {
        return back()->withErrors(['code' => 'Código incorrecto']);
    }

    $user->update([
        'two_factor_code' => null,
        'two_factor_expires_at' => null,
    ]);

    return redirect()->route('dashboard');
}
```

**Paso 2: Vista HTML**

```blade
<!-- resources/views/auth/verify-2fa.blade.php -->
<form action="{{ route('auth.verify-2fa') }}" method="POST">
    @csrf
    <input type="text" name="code" placeholder="Ingresa el código de 6 dígitos" required>
    <button type="submit">Verificar</button>
</form>
```

---

## 5. STRIPE INTEGRATION

### Paso 1: Instalar y Configurar

```bash
composer require stripe/stripe-php
```

```php
// .env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Paso 2: Service para Pagos

```php
// app/Services/StripePaymentService.php
<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\Pedido;
use App\Models\Payment;

class StripePaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Crear PaymentIntent para un pedido
     */
    public function createPaymentIntent(Pedido $pedido): PaymentIntent
    {
        $intent = PaymentIntent::create([
            'amount' => (int)($pedido->total * 100), // En centavos
            'currency' => 'usd',
            'metadata' => [
                'pedido_id' => $pedido->id,
                'mesa_id' => $pedido->mesa_id,
                'restaurante_id' => $pedido->restaurante_id,
            ],
            'receipt_email' => $pedido->cliente?->email,
        ]);

        // Guardar en BD
        Payment::create([
            'pedido_id' => $pedido->id,
            'provider' => 'stripe',
            'transaction_id' => $intent->id,
            'amount' => $pedido->total,
            'status' => 'pending',
            'payload' => json_encode($intent),
        ]);

        return $intent;
    }

    /**
     * Confirmar pago (llamado desde webhook)
     */
    public function confirmPayment(string $paymentIntentId): bool
    {
        $intent = PaymentIntent::retrieve($paymentIntentId);

        if ($intent->status === 'succeeded') {
            $payment = Payment::where('transaction_id', $paymentIntentId)->first();
            
            if ($payment) {
                $payment->update(['status' => 'paid']);
                $payment->pedido->markAsPaid();
                return true;
            }
        }

        return false;
    }

    /**
     * Webhook para confirmación de pago
     */
    public function handleWebhook(array $data): void
    {
        $event = json_decode($data, true);

        match ($event['type']) {
            'payment_intent.succeeded' => 
                $this->confirmPayment($event['data']['object']['id']),
            'payment_intent.payment_failed' => 
                $this->handlePaymentFailed($event['data']['object']),
            default => null
        };
    }
}
```

### Paso 3: API Controller

```php
// app/Http/Controllers/PaymentController.php
public function createPaymentIntent(Pedido $pedido)
{
    $service = new StripePaymentService();
    $intent = $service->createPaymentIntent($pedido);

    return response()->json([
        'clientSecret' => $intent->client_secret,
        'pedido_id' => $pedido->id,
        'amount' => $pedido->total,
    ]);
}

public function handleWebhook(Request $request)
{
    $payload = @file_get_contents('php://input');
    $sigHeader = $request->header('Stripe-Signature');

    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload,
            $sigHeader,
            config('services.stripe.webhook_secret')
        );

        $service = new StripePaymentService();
        $service->handleWebhook($payload);

        return response()->json(['received' => true]);
    } catch (\Stripe\Exception\SignatureVerificationException $e) {
        return response()->json(['error' => 'Invalid signature'], 403);
    }
}
```

### Paso 4: Frontend React

```typescript
// resources/js/pages/Checkout.tsx
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export function CheckoutForm({ pedidoId }: { pedidoId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Obtener PaymentIntent
    const { data: { clientSecret } } = await api.post(`/pedidos/${pedidoId}/payment-intent`);

    // Confirmar pago
    const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements!.getElement(CardElement)!,
      },
    });

    if (error) {
      toast.error('Pago rechazado: ' + error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      toast.success('¡Pago exitoso!');
      navigate(`/pedido/${pedidoId}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || loading}>
        {loading ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  );
}
```

---

## 6. TESTING CON PEST

### Paso 1: Setup

```bash
composer require pestphp/pest pestphp/pest-plugin-laravel --dev
php artisan pest:install
```

### Paso 2: Test Feature básico

```php
// tests/Feature/PedidoTest.php
<?php

use App\Models\Mesa;
use App\Models\Plato;
use App\Models\Restaurante;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can create order via QR', function () {
    // Setup
    $restaurante = Restaurante::factory()->create(['activo' => true]);
    $mesa = Mesa::factory()->create([
        'restaurante_id' => $restaurante->id,
        'activa' => true,
    ]);
    $plato = Plato::factory()->create([
        'restaurante_id' => $restaurante->id,
        'precio' => 25.00,
        'activo' => true,
    ]);

    // Execute
    $response = $this->postJson('/api/pedidos', [
        'mesa_token' => $mesa->qr_token,
        'items' => [
            ['plato_id' => $plato->id, 'cantidad' => 2, 'precio_unitario' => 25.00]
        ],
        'cliente_nombre' => 'John Doe',
    ]);

    // Assert
    $response->assertCreated();
    $this->assertDatabaseHas('pedidos', [
        'mesa_id' => $mesa->id,
        'estado' => 'pendiente',
    ]);
});

test('rejects modified price', function () {
    $restaurante = Restaurante::factory()->create(['activo' => true]);
    $mesa = Mesa::factory()->create(['restaurante_id' => $restaurante->id, 'activa' => true]);
    $plato = Plato::factory()->create([
        'restaurante_id' => $restaurante->id,
        'precio' => 25.00,
        'activo' => true,
    ]);

    $response = $this->postJson('/api/pedidos', [
        'mesa_token' => $mesa->qr_token,
        'items' => [
            ['plato_id' => $plato->id, 'cantidad' => 2, 'precio_unitario' => 5.00] // ❌ MODIFICADO
        ],
    ]);

    $response->assertUnprocessable();
    $this->assertDatabaseMissing('pedidos', ['mesa_id' => $mesa->id]);
});
```

### Paso 3: Ejecutar Tests

```bash
composer test
# O con coverage
php artisan pest --coverage
```

---

## 7. ERROR TRACKING CON SENTRY

### Paso 1: Instalar

```bash
composer require sentry/sentry-laravel
php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"
```

### Paso 2: Configurar

```php
// .env
SENTRY_LARAVEL_DSN=https://xxxxx@sentry.io/xxxxx

// config/sentry.php
'dsn' => env('SENTRY_LARAVEL_DSN'),
'tracing' => [
    'enabled' => true,
    'traces_sample_rate' => 1.0,
],
'breadcrumbs' => [
    'logs' => true,
    'queries' => true,
    'http_client_requests' => true,
],
```

### Paso 3: Usar en Código

```php
// app/Exceptions/Handler.php
public function register()
{
    $this->reportable(function (Throwable $e) {
        if (app()->bound('sentry')) {
            app('sentry')->captureException($e);
        }
    });
}

// En controladores
try {
    $payment = $this->processPayment($pedido);
} catch (PaymentException $e) {
    \Sentry\captureException($e, [
        'contexts' => [
            'pedido' => ['id' => $pedido->id, 'total' => $pedido->total],
            'usuario' => ['id' => auth()->id()],
        ],
        'level' => 'error',
    ]);
    
    throw $e;
}
```

---

## 8. CI/CD CON GITHUB ACTIONS

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: testing
        options: >-
          --health-cmd="mysqladmin ping" 
          --health-interval=10s 
          --health-timeout=5s
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo, pdo_mysql, mbstring
          tools: composer:v2

      - name: Cache Composer
        uses: actions/cache@v3
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}

      - name: Install dependencies
        run: composer install -q --no-ansi --no-interaction --no-scripts

      - name: Prepare application
        run: |
          cp .env.example .env.testing
          php artisan key:generate --env=testing
          php artisan migrate --env=testing

      - name: Execute tests
        run: composer test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

---

## PRÓXIMOS PASOS

1. Elegir **uno** de los requerimientos e implementarlo
2. Crear tests para validar
3. Hacer PR y pedir review
4. Mergear a main una vez aprobado
5. Deploy a producción
6. Ir al siguiente

**Recomendación:** Empezar por Validación de Precios (1 día) + Rate Limiting (1 día)

