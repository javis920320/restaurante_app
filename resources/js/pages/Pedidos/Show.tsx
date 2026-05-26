import EstadoBadge from '@/components/Pedidos/EstadoBadge';
import EstadoSelector from '@/components/Pedidos/EstadoSelector';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminPedidos } from '@/hooks/useAdminPedidos';
import AppLayout from '@/layouts/app-layout';
import { HistorialEstado, Pedido } from '@/services/pedidoService';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    FileText, 
    MapPin, 
    QrCode, 
    User, 
    Utensils,
    ChefHat,
    Bell,
    Truck,
    Calendar,
    MessageSquare,
    AlertCircle,
    UserCheck,
    ChevronRight,
    DollarSign,
    CheckCircle2
} from 'lucide-react';
import React, { useState } from 'react';

interface ShowProps {
    pedido: Pedido;
}

const ESTADOS_LABELS: Record<string, string> = {
    pendiente: 'Creado',
    confirmado: 'Confirmado',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    pagado: 'Facturado / Cerrado',
    cancelado: 'Cancelado',
};

const ESTADOS_COLORS: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30',
    confirmado: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
    en_preparacion: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-450 dark:border-orange-900/30',
    listo: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30',
    entregado: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30',
    pagado: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    cancelado: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30',
};

function HistorialTimeline({ historial }: { historial: HistorialEstado[] }) {
    if (!historial || historial.length === 0) return null;

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
            <h2 className="mb-4 text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-655" />
                Historial de Estados
            </h2>
            <ol className="relative border-l border-zinc-200 dark:border-zinc-800 ml-2 space-y-4">
                {historial.map((entrada) => (
                    <li key={entrada.id} className="ml-5 relative">
                        <div className="absolute -left-[26px] mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-400" />
                        <div className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ESTADOS_COLORS[entrada.estado_nuevo] ?? 'bg-zinc-100 text-zinc-800 border-zinc-200'}`}>
                            {ESTADOS_LABELS[entrada.estado_nuevo] ?? entrada.estado_nuevo}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">{formatDateTime(entrada.created_at)}</p>
                        {entrada.user && (
                            <p className="mt-0.5 text-xs text-zinc-655 dark:text-zinc-400">
                                Por: <span className="font-semibold">{entrada.user.name}</span>
                                {entrada.canal && (
                                    <span className="ml-1 text-zinc-400 dark:text-zinc-600 font-medium">
                                        (
                                        {entrada.canal === 'qr' ? (
                                            <><QrCode className="mr-0.5 inline h-3 w-3" />QR</>
                                        ) : (
                                            <><Utensils className="mr-0.5 inline h-3 w-3" />Mesero</>
                                        )}
                                        )
                                    </span>
                                )}
                            </p>
                        )}
                        {!entrada.user && entrada.canal === 'qr' && (
                            <p className="mt-0.5 text-xs text-zinc-500 font-medium">
                                <QrCode className="mr-0.5 inline h-3 w-3" />
                                Pedido por QR
                            </p>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function Show({ pedido: pedidoInicial }: ShowProps) {
    const { cambiarEstado } = useAdminPedidos();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
        await cambiarEstado(pedidoId, nuevoEstado);
        window.location.reload();
    };

    const puedeEditarEstado = !['pagado', 'cancelado'].includes(pedidoInicial.estado);

    // Obtener la hora del historial para cada estado
    const getStepTime = (stepValue: string) => {
        const entry = pedidoInicial.historial?.find((h) => h.estado_nuevo === stepValue);
        if (!entry) return null;
        return new Date(entry.created_at).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Pasos del Stepper
    const STEPPER_STEPS = [
        { value: 'pendiente', label: 'Creado', icon: FileText },
        { value: 'confirmado', label: 'Confirmado', icon: CheckCircle2 },
        { value: 'en_preparacion', label: 'En Cocina', icon: ChefHat },
        { value: 'listo', label: 'Listo', icon: Bell },
        { value: 'entregado', label: 'Entregado', icon: Truck },
    ];

    const currentStepIndex = STEPPER_STEPS.findIndex(s => s.value === pedidoInicial.estado);
    const isCanceled = pedidoInicial.estado === 'cancelado';
    const isPaidHistorical = pedidoInicial.estado === 'pagado';
    
    // Si ya está facturado/cerrado en estado operativo histórico, marcar todos como completados
    const activeStepIndex = isPaidHistorical ? STEPPER_STEPS.length - 1 : currentStepIndex;

    return (
        <AppLayout>
            <Head title={`Pedido #${pedidoInicial.id}`} />

            <div className="space-y-6">
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="h-9 px-3 rounded-lg border-zinc-200 dark:border-zinc-850">
                            <Link href="/pedidos">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                                    Pedido #{pedidoInicial.id}
                                </h1>
                                {pedidoInicial.canal && (
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 gap-1 px-2.5 py-0.5 rounded-full">
                                        {pedidoInicial.canal === 'qr' ? (
                                            <><QrCode className="h-3 w-3" /> QR</>
                                        ) : (
                                            <><Utensils className="h-3 w-3" /> Mesero</>
                                        )}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-zinc-400 dark:text-zinc-550 mt-1 font-medium">
                                Registrado el {formatDate(pedidoInicial.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Estados contiguos (Eje Operativo + Eje Financiero) */}
                    <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <EstadoBadge estado={pedidoInicial.estado} />
                     {/*    {pedidoInicial.payment_status && (
                            <PagoBadge payment_status={pedidoInicial.payment_status} />
                        )} */}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Panel Izquierdo: Stepper y Productos */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Stepper de Progreso o Banner de Cancelado */}
                        {isCanceled ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-950/20 dark:bg-red-950/15 flex items-start gap-3.5">
                                <div className="p-3 bg-red-650 text-white rounded-xl shadow-xs">
                                    <AlertCircle className="h-6 w-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h3 className="text-red-900 dark:text-red-400 font-extrabold text-base">Pedido Cancelado</h3>
                                    <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                                        Esta orden fue dada de baja del sistema. Para ver más detalles, por favor revisa el historial de estados al pie de la página.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-zinc-900">
                                <h3 className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4" />
                                    Progreso de la Orden
                                </h3>
                                {/* Stepper Progress Bar */}
                                <div className="relative flex justify-between items-center w-full mt-2 px-1.5 sm:px-6">
                                    {/* Línea de fondo */}
                                    <div className="absolute top-[18px] left-[32px] left-[32px] sm:left-[54px] sm:right-[54px] h-1 bg-zinc-100 dark:bg-zinc-800 z-0" />
                                    {/* Línea activa */}
                                    <div 
                                        className="absolute top-[18px] left-[32px] sm:left-[54px] h-1 bg-blue-600 dark:bg-blue-500 z-0 transition-all duration-500" 
                                        style={{ 
                                            width: activeStepIndex >= 0 
                                                ? `calc(${ (activeStepIndex / (STEPPER_STEPS.length - 1)) * 100 }% - ${activeStepIndex === STEPPER_STEPS.length - 1 ? '16px' : '0px'})` 
                                                : '0%' 
                                        }}
                                    />

                                    {/* Círculos de Pasos */}
                                    {STEPPER_STEPS.map((step, idx) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = activeStepIndex > idx || (isPaidHistorical && idx === STEPPER_STEPS.length - 1);
                                        const isActive = activeStepIndex === idx;
                                        const stepTime = getStepTime(step.value);

                                        return (
                                            <div key={step.value} className="flex flex-col items-center z-10 text-center relative group min-w-[50px] sm:min-w-[70px]">
                                                {/* Círculo */}
                                                <div 
                                                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                        isCompleted 
                                                            ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500' 
                                                            : isActive
                                                                ? 'bg-white border-blue-600 text-blue-600 dark:bg-zinc-900 dark:border-blue-500 dark:text-blue-400 ring-4 ring-blue-500/10 dark:ring-blue-500/20 font-black animate-pulse-slow' 
                                                                : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-650'
                                                    }`}
                                                >
                                                    <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                {/* Etiqueta */}
                                                <span className={`text-[10px] sm:text-xs font-bold mt-2 tracking-tight ${
                                                    isCompleted || isActive ? 'text-zinc-850 dark:text-zinc-200 font-extrabold' : 'text-zinc-400 dark:text-zinc-600'
                                                }`}>
                                                    {step.label}
                                                </span>
                                                {/* Hora del estado */}
                                                {stepTime ? (
                                                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded-md mt-1">
                                                        {stepTime}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-transparent select-none mt-1">-</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Listado de Platos */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-850 dark:bg-zinc-900">
                            <h2 className="mb-4 text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-zinc-800">
                                <Utensils className="h-5 w-5 text-blue-655" />
                                Detalle de Consumo
                            </h2>

                            {pedidoInicial.detalles && pedidoInicial.detalles.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {pedidoInicial.detalles.map((detalle) => (
                                            <div
                                                key={detalle.id}
                                                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 px-2 rounded-xl transition-all duration-150"
                                            >
                                                {/* Cantidad */}
                                                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 text-blue-750 dark:bg-blue-955/40 dark:text-blue-400 font-black text-sm shrink-0 border border-blue-100/50 dark:border-blue-900/10">
                                                    x{detalle.cantidad}
                                                </div>

                                                {/* Información Plato */}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-sm sm:text-base text-zinc-850 dark:text-zinc-250 truncate">
                                                        {detalle.producto.nombre}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-0.5 font-medium">
                                                        Precio unitario: {formatPrice(detalle.precio_unitario)}
                                                    </p>
                                                    {/* Notas específicas del plato */}
                                                    {detalle.notas && (
                                                        <div className="mt-2 inline-flex items-start gap-1.5 bg-amber-50/70 dark:bg-amber-950/25 text-amber-800 dark:text-amber-300 border border-amber-100/50 dark:border-amber-900/30 py-1 px-2.5 rounded-lg text-xs leading-normal">
                                                            <FileText className="h-3.5 w-3.5 mt-0.5 text-amber-600 dark:text-amber-500 shrink-0" />
                                                            <span className="font-semibold italic">Nota: {detalle.notas}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Subtotal Item */}
                                                <div className="text-right shrink-0">
                                                    <span className="font-black text-sm sm:text-base text-zinc-900 dark:text-white">
                                                        {formatPrice(detalle.subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Caja de Totales Premium */}
                                    <div className="space-y-3 border-t pt-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/10 p-4 rounded-xl mt-4">
                                        <div className="flex justify-between text-xs sm:text-sm font-medium text-zinc-550 dark:text-zinc-400">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(pedidoInicial.subtotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-3 dark:border-zinc-800">
                                            <span className="text-sm sm:text-base font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                                Total Facturado
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                                {formatPrice(pedidoInicial.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-400 dark:text-zinc-650 border border-dashed rounded-xl">
                                    <Utensils className="h-10 w-10 mx-auto mb-2 opacity-50 stroke-[1.5]" />
                                    <p className="text-sm font-medium">No hay productos registrados en esta orden</p>
                                </div>
                            )}
                        </div>

                        {/* Notas del pedido generales */}
                        {pedidoInicial.notas && (
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-zinc-900">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                                            Notas Generales del Pedido
                                        </h2>
                                        <p className="text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed font-medium mt-1">
                                            {pedidoInicial.notas}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Historial de estados (Timeline) */}
                        {pedidoInicial.historial && pedidoInicial.historial.length > 0 && (
                            <HistorialTimeline historial={pedidoInicial.historial} />
                        )}
                    </div>

                    {/* Panel Derecho: Cambiar Estado y Metadatos */}
                    <div className="space-y-6">
                        {/* Cambiar estado */}
                        {puedeEditarEstado && (
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-zinc-900 space-y-3">
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <ChevronRight className="h-4 w-4 text-blue-600" />
                                    Cambiar Estado Operativo
                                </h2>
                                <EstadoSelector
                                    estadoActual={pedidoInicial.estado}
                                    pedidoId={pedidoInicial.id}
                                    onCambiarEstado={handleCambiarEstado}
                                />
                            </div>
                        )}

                        {/* Información del pedido (Metadatos) */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-zinc-900">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-3 dark:border-zinc-800 mb-4">
                                <FileText className="h-4.5 w-4.5 text-blue-655" />
                                Información de Servicio
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-xl shrink-0">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Mesa</p>
                                        <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                            {pedidoInicial.mesa?.nombre || `Mesa #${pedidoInicial.mesa_id}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-xl shrink-0">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Fecha y hora de Registro</p>
                                        <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                            {formatDate(pedidoInicial.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {pedidoInicial.user && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-xl shrink-0">
                                            <UserCheck className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Atendido por</p>
                                            <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                                {pedidoInicial.user.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {pedidoInicial.cliente && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-655 dark:text-zinc-400 rounded-xl shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Cliente de la Mesa</p>
                                            <p className="font-extrabold text-sm text-zinc-850 dark:text-zinc-200 truncate">
                                                {pedidoInicial.cliente}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );

}
