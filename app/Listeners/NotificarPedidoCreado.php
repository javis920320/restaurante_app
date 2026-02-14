<?php

namespace App\Listeners;

use App\Events\PedidoCreado;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotificarPedidoCreado implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PedidoCreado $event): void
    {
        // Aquí se pueden agregar notificaciones:
        // - Enviar notificación a cocina/bar
        // - Imprimir ticket automáticamente
        // - Enviar notificación push a dispositivos
        // - Registrar en logs para auditoría
        
        Log::info('Nuevo pedido creado - Notificación enviada', [
            'pedido_id' => $event->pedido->id,
            'mesa_id' => $event->pedido->mesa_id,
            'total' => $event->pedido->total,
            'items_count' => $event->pedido->detalles->count(),
        ]);

        // Ejemplo: Imprimir en cocina (simulado)
        // PrinterService::imprimirTicket($event->pedido);
        
        // Ejemplo: Notificar al panel de cocina vía WebSocket
        // Ya se hace automáticamente con ShouldBroadcast en el Event
    }
}
