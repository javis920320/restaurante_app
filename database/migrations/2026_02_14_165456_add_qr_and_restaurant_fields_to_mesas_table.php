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
        Schema::table('mesas', function (Blueprint $table) {
            $table->string('qr_token')->unique()->after('nombre');
            $table->foreignId('restaurante_id')->nullable()->after('id')->constrained('restaurantes')->onDelete('cascade');
            $table->boolean('activa')->default(true)->after('estado');
            
            // Índices
            $table->index('qr_token');
            $table->index('restaurante_id');
            $table->index('activa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mesas', function (Blueprint $table) {
            $table->dropForeign(['restaurante_id']);
            $table->dropIndex(['qr_token']);
            $table->dropIndex(['restaurante_id']);
            $table->dropIndex(['activa']);
            $table->dropColumn(['qr_token', 'restaurante_id', 'activa']);
        });
    }
};
