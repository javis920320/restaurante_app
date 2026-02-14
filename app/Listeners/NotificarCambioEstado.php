<?php

namespace App\Listeners;

use App\Events\PedidoEstadoActualizado;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotificarCambioEstado implements ShouldQueue
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
    public function handle(PedidoEstadoActualizado $event): void
    {
        // Aquí se pueden agregar notificaciones según el estado:
        // - "listo" → notificar a meseros
        // - "entregado" → notificar a caja
        // - "pagado" → enviar recibo digital
        
        Log::info('Estado de pedido actualizado - Notificación enviada', [
            'pedido_id' => $event->pedido->id,
            'mesa_id' => $event->pedido->mesa_id,
            'estado_anterior' => $event->estadoAnterior,
            'estado_nuevo' => $event->estadoNuevo,
        ]);

        // Ejemplo: Notificar según el estado
        match ($event->estadoNuevo) {
            'confirmado' => $this->notificarCocina($event),
            'listo' => $this->notificarMesero($event),
            'pagado' => $this->enviarRecibo($event),
            default => null,
        };
    }

    protected function notificarCocina(PedidoEstadoActualizado $event): void
    {
        // Lógica para notificar a cocina
        Log::debug('Notificación enviada a cocina', ['pedido_id' => $event->pedido->id]);
    }

    protected function notificarMesero(PedidoEstadoActualizado $event): void
    {
        // Lógica para notificar a meseros
        Log::debug('Notificación enviada a mesero', ['pedido_id' => $event->pedido->id]);
    }

    protected function enviarRecibo(PedidoEstadoActualizado $event): void
    {
        // Lógica para enviar recibo
        Log::debug('Recibo enviado', ['pedido_id' => $event->pedido->id]);
    }
}
