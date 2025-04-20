<?php

namespace App\Http\Controllers;

use App\Models\DatosTraslado;
use Illuminate\Http\Request;

class DatosTrasladoController extends Controller
{
    public function store(Request $request)
    {
        return DatosTraslado::updateOrCreate(
            ['envio_id' => $request->envio_id],
            $request->only(['dueno', 'empresa_transportista', 'lugar_entrega', 'clave_producto_sat'])
        );
    }

    public function show($envio_id)
    {
        return DatosTraslado::where('envio_id', $envio_id)->firstOrFail();
    }
}
