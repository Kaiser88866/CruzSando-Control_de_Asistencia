<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrendaEnvio extends Model
{
    protected $table = 'prendas_envio';

    public $timestamps = false;

    protected $fillable = [
        'id_envio',
        'descripcion',
        'talla',
        'cantidad',
        'numero_corte',
        'paquete',
        'precio_unitario',
        'created_at', // ✅ <-- aquí
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
