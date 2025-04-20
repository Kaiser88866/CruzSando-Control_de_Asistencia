<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DatosTraslado extends Model
{
    use HasFactory;

    protected $table = 'datos_traslado';

    protected $fillable = [
        'dueno',
        'empresa_transportista',
        'lugar_entrega',
        'clave_producto_sat',
        'envio_id',
    ];

    // Relación con envío
    public function envio()
    {
        return $this->belongsTo(Envio::class);
    }
}
