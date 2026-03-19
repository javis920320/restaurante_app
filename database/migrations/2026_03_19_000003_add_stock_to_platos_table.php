<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platos', function (Blueprint $table) {
            $table->unsignedInteger('stock')->nullable()->after('disponible');
        });
    }

    public function down(): void
    {
        Schema::table('platos', function (Blueprint $table) {
            $table->dropColumn('stock');
        });
    }
};
