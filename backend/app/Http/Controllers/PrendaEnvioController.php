<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PrendaEnvio;

class PrendaEnvioController extends Controller
{
    public function index()
    {
        return PrendaEnvio::orderBy('created_at')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_envio' => 'required|exists:envios,id',
            'descripcion' => 'required|string',
            'talla' => 'required|string',
            'cantidad' => 'required|integer|min:1',
            'numero_corte' => 'required|string',
            'paquete' => 'required|integer|min:1',
            'created_at' => 'required|date', // ✅ <-- aquí
        ]);

        $prenda = PrendaEnvio::create($validated);

        return response()->json($prenda, 201);
    }

    public function update(Request $request, $id)
    {
        $prenda = PrendaEnvio::findOrFail($id);

        $validated = $request->validate([
            'id_envio' => 'required|exists:envios,id',
            'descripcion' => 'required|string',
            'talla' => 'required|string',
            'cantidad' => 'required|integer|min:1',
            'numero_corte' => 'required|string',
            'paquete' => 'required|integer|min:1',
            'created_at' => 'nullable|date',
        ]);

        $prenda->update($validated);
        return response()->json(['message' => 'Prenda actualizada'], 200);
    }

    public function destroy($id)
    {
        $prenda = PrendaEnvio::findOrFail($id);
        $prenda->delete();

        return response()->json(['message' => 'Prenda eliminada']);
    }
}
