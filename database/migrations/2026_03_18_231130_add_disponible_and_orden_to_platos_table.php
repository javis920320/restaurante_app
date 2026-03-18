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
            $table->boolean('disponible')->default(true)->after('activo');
            $table->unsignedSmallInteger('orden')->default(0)->after('disponible');
            $table->index('disponible');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('platos', function (Blueprint $table) {
            $table->dropIndex(['disponible']);
            $table->dropColumn(['disponible', 'orden']);
        });
    }
};
