<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Envio;

class EnvioController extends Controller
{
    public function index()
    {
        return Envio::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empresa_destino' => 'required|string',
            'persona_recolectora' => 'required|string',
            'direccion_envio' => 'required|string',
        ]);

        $envio = Envio::create($validated);

        return response()->json($envio, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'empresa_destino' => 'required|string',
            'persona_recolectora' => 'required|string',
            'direccion_envio' => 'required|string',
        ]);

        $envio = Envio::findOrFail($id);
        $envio->update($validated); // ✅ Laravel actualizará automáticamente updated_at

        return response()->json(['message' => 'Datos de envío actualizados']);
    }
}
