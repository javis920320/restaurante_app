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
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Nombre del cliente
            $table->string('apellido'); // Apellido del cliente 
            $table->string('dni')->unique(); // DNI del cliente 
            $table->string('telefono'); // Teléfono del cliente 
            $table->string('email')->unique(); // Email del cliente
            $table->string('direccion'); // Dirección del cliente           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
