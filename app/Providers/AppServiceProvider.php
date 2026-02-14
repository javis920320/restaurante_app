<?php

namespace App\Providers;

use App\Events\PedidoCreado;
use App\Events\PedidoEstadoActualizado;
use App\Listeners\NotificarPedidoCreado;
use App\Listeners\NotificarCambioEstado;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (env('APP_ENV') === 'production') {
            URL::forceScheme('https');
        }

        // Registrar eventos y listeners
        Event::listen(
            PedidoCreado::class,
            NotificarPedidoCreado::class,
        );

        Event::listen(
            PedidoEstadoActualizado::class,
            NotificarCambioEstado::class,
        );
    }
}
