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
        Schema::table('platos', function (Blueprint $table) {
            $table->foreignId('restaurante_id')->nullable()->after('categoria_id')->constrained('restaurantes')->onDelete('cascade');
            $table->boolean('activo')->default(true)->after('precio');
            
            // Solo agregar softDeletes si no existe la columna deleted_at
            if (!Schema::hasColumn('platos', 'deleted_at')) {
                $table->softDeletes();
            }
            
            // Índices
            $table->index('activo');
            $table->index('restaurante_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('platos', function (Blueprint $table) {
            $table->dropForeign(['restaurante_id']);
            $table->dropIndex(['activo']);
            $table->dropIndex(['restaurante_id']);
            $table->dropColumn(['restaurante_id', 'activo']);
        });
    }
};
