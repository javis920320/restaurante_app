<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashMovement extends Model
{
    protected $table = 'cash_movements';

    const TIPOS = ['ingreso', 'egreso'];

    const SUBTIPOS = ['venta', 'cambio_entregado', 'gasto_operativo', 'retiro_caja', 'ingreso_manual', 'correccion'];

    const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

    protected $fillable = [
        'cash_register_id',
        'cash_opening_id',
        'tipo',
        'subtipo',
        'monto',
        'metodo_pago',
        'referencia_id',
        'descripcion',
        'usuario_id',
        'fecha',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha' => 'datetime',
    ];

    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    public function cashOpening(): BelongsTo
    {
        return $this->belongsTo(CashOpening::class, 'cash_opening_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
