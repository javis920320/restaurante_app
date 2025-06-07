<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mesas', function (Blueprint $table) {
            $table->enum('ubicacion', [
                'Interior',
                'Exterior',
                'Patio',
                'Balcón',
                'Jardín',
                'Barra',
                'Terraza',
                'VIP',
                'Zona de fumadores'
            ])
                ->default('Interior')
                ->after('estado')
                ->comment('Ubicación de la mesa: interior o exterior');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mesas', function (Blueprint $table) {
            //
        });
    }
};
