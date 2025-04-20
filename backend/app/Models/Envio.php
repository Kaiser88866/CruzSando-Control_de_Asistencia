<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Envio extends Model
{
    protected $table = 'envios';

    protected $fillable = [
        'empresa_destino',
        'persona_recolectora',
        'direccion_envio',
        'updated_at',
    ];

    public $timestamps = true; // ✅ Esto es lo más importante
}
