<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            // Cambiar la columna estado a los valores correctos
            $table->dropColumn('estado');
        });
        
        Schema::table('pedidos', function (Blueprint $table) {
            $table->enum('estado', ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado'])
                ->default('pendiente')
                ->after('mesa_id');
            $table->decimal('subtotal', 10, 2)->default(0)->after('estado');
            $table->decimal('total', 10, 2)->default(0)->after('subtotal');
            $table->text('notas')->nullable()->after('total');
            
            // Solo agregar softDeletes si no existe la columna deleted_at
            if (!Schema::hasColumn('pedidos', 'deleted_at')) {
                $table->softDeletes();
            }
            
            // Índices
            $table->index('estado');
            $table->index(['mesa_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            // Drop indexes that depend on estado column
            if (Schema::hasColumn('pedidos', 'estado')) {
                $table->dropIndex(['estado']);
                $table->dropIndex(['mesa_id', 'estado']);
            }
            $table->dropColumn(['subtotal', 'total', 'notas']);
        });
        
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
        
        Schema::table('pedidos', function (Blueprint $table) {
            $table->enum('estado', ['pendiente', 'en_cocina', 'servido', 'pagado'])
                ->after('mesa_id');
        });
    }
};
