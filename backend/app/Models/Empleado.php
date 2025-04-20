<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    protected $table = 'empleados';

    protected $fillable = [
        'nombre',
        'tipo_pago',
        'pago_unitario',
        'tipo_empleado',
        'codigo_huella',
        'estado',
    ];

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_empleado');
    }
}
