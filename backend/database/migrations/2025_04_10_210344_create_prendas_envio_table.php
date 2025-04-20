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
        Schema::create('prendas_envio', function (Blueprint $table) {
            $table->id(); // PK
            $table->foreignId('id_envio')->constrained('envios')->onDelete('cascade');
            $table->string('descripcion')->nullable();
            $table->string('talla')->nullable();
            $table->integer('cantidad')->nullable();
            $table->string('numero_corte')->nullable();
            $table->decimal('precio_unitario', 8, 2)->nullable();
            $table->timestamp('created_at')->useCurrent()->nullable();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prendas_envio');
    }
};
