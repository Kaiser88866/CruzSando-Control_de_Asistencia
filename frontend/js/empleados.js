let empleadosCargados = [];
let mostrarInactivos = true;
let columnaOrdenActual = 'nombre';
let ordenAscendente = true;

document.addEventListener('DOMContentLoaded', () => {
    cargarEmpleados();

    const toggleBtn = document.getElementById('btn-toggle-inactivos');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            mostrarInactivos = !mostrarInactivos;
            toggleBtn.textContent = mostrarInactivos ? 'Ocultar inactivos' : 'Mostrar todos';
            renderizarTabla();
        });
    }
});

function formatearFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-MX') + ' ' + f.toLocaleTimeString('es-MX');
}

async function cargarEmpleados() {
    try {
        const res = await window.api.get('empleados');
        empleadosCargados = res.data;
        renderizarTabla();
    } catch (error) {
        console.error('Error cargando empleados:', error);
        Swal.fire('Error', 'No se pudieron cargar los empleados.', 'error');
    }
}

function renderizarTabla() {
    const cuerpo = document.getElementById('cuerpoTablaEmpleados');
    cuerpo.innerHTML = '';

    const empleadosFiltrados = empleadosCargados
        .filter(emp => mostrarInactivos || emp.estado === 'activo')
        .sort((a, b) => {
            let valA = a[columnaOrdenActual];
            let valB = b[columnaOrdenActual];

            // Convertir fechas si la columna es created_at o updated_at
            if (columnaOrdenActual.includes('at')) {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            return ordenAscendente
                ? valA > valB ? 1 : valA < valB ? -1 : 0
                : valA < valB ? 1 : valA > valB ? -1 : 0;
        });

    empleadosFiltrados.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-2 cursor-pointer">${emp.nombre}</td>
            <td class="px-4 py-2">${emp.tipo_pago}</td>
            <td class="px-4 py-2">$${emp.pago_unitario}</td>
            <td class="px-4 py-2">${emp.tipo_empleado}</td>
            <td class="px-4 py-2">${emp.codigo_huella ? 'Registrada' : 'No registrada'}</td>
            <td class="px-4 py-2">${formatearFecha(emp.created_at)}</td>
            <td class="px-4 py-2">${formatearFecha(emp.updated_at)}</td>
            <td class="px-4 py-2 font-semibold ${emp.estado === 'activo' ? 'text-green-600' : 'text-red-600'}">${emp.estado === 'activo' ? 'Activo' : 'Inactivo'}</td>
            <td class="px-4 py-2">
                <button class="text-blue-600 hover:underline" onclick='editarEmpleado(${JSON.stringify(emp)})'>Editar</button>
            </td>
        `;
        cuerpo.appendChild(tr);
    });
    actualizarEncabezados();
    const total = empleadosCargados.length;
    const visibles = empleadosCargados.filter(emp => mostrarInactivos || emp.estado === 'activo').length;
    document.getElementById('infoEmpleados').textContent =
        `Mostrando ${visibles} de ${total} empleados${mostrarInactivos ? '' : ' (solo activos)'}.`;

}


function abrirModalNuevoEmpleado() {
    Swal.fire({
        title: 'Nuevo Empleado',
        html: `
            <div class="space-y-4 text-left w-full max-w-md mx-auto">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" id="nombre" class="campo-input w-full px-3 py-2 border border-gray-300 rounded" placeholder="Nombre">
                    <p id="error-nombre" class="text-red-600 text-xs mt-1 hidden">Este campo es obligatorio</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo de pago</label>
                    <select id="tipo_pago" class="campo-input w-full px-3 py-2 border border-gray-300 rounded">
                        <option value="" disabled selected>Selecciona</option>
                        <option value="por hora">Por hora</option>
                        <option value="por día">Por día</option>
                    </select>
                    <p id="error-tipo_pago" class="text-red-600 text-xs mt-1 hidden">Selecciona un tipo de pago</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Pago unitario</label>
                    <input type="number" id="pago_unitario" class="campo-input w-full px-3 py-2 border border-gray-300 rounded" placeholder="Pago unitario">
                    <p id="error-pago_unitario" class="text-red-600 text-xs mt-1 hidden">Ingresa un monto válido</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo de empleado</label>
                    <select id="tipo_empleado" class="campo-input w-full px-3 py-2 border border-gray-300 rounded" onchange="document.getElementById('otro_empleado').style.display = this.value === 'Otro' ? 'block' : 'none'">
                        <option value="" disabled selected>Selecciona</option>
                        <option value="Costurero">Costurero</option>
                        <option value="Manual">Manual</option>
                        <option value="Encargado">Encargado</option>
                        <option value="Otro">Otro</option>
                    </select>
                    <p id="error-tipo_empleado" class="text-red-600 text-xs mt-1 hidden">Selecciona un tipo de empleado</p>
                </div>

                <div id="otro_empleado" style="display:none;">
                    <label class="block text-sm font-medium text-gray-700">Especificar tipo (si elegiste Otro)</label>
                    <input type="text" id="input_otro_empleado" class="campo-input w-full px-3 py-2 border border-gray-300 rounded" placeholder="Especificar tipo">
                    <p id="error-otro_empleado" class="text-red-600 text-xs mt-1 hidden">Especifica el tipo de empleado</p>
                </div>
            </div>
        `,
        confirmButtonText: 'Guardar',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: async () => {
            let hayError = false;

            // Limpiar estilos
            document.querySelectorAll('.campo-input').forEach(el => {
                el.classList.remove('border-red-600', 'ring-1', 'ring-red-600');
            });
            document.querySelectorAll('[id^="error-"]').forEach(p => p.classList.add('hidden'));

            const nombre = document.getElementById('nombre').value.trim();
            const tipo_pago = document.getElementById('tipo_pago').value;
            const pago_unitario = document.getElementById('pago_unitario').value.trim();
            let tipo_empleado = document.getElementById('tipo_empleado').value;
            const otro = document.getElementById('input_otro_empleado')?.value.trim();

            if (!nombre) {
                hayError = true;
                document.getElementById('nombre').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-nombre').classList.remove('hidden');
            }

            if (!tipo_pago) {
                hayError = true;
                document.getElementById('tipo_pago').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-tipo_pago').classList.remove('hidden');
            }

            if (!pago_unitario || isNaN(pago_unitario) || Number(pago_unitario) <= 0) {
                hayError = true;
                document.getElementById('pago_unitario').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-pago_unitario').classList.remove('hidden');
            }

            if (!tipo_empleado) {
                hayError = true;
                document.getElementById('tipo_empleado').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-tipo_empleado').classList.remove('hidden');
            }

            if (tipo_empleado === 'Otro' && (!otro || otro === '')) {
                hayError = true;
                document.getElementById('input_otro_empleado').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-otro_empleado').classList.remove('hidden');
            }

            if (hayError) return false;
            if (tipo_empleado === 'Otro') tipo_empleado = otro;

            const nuevoEmpleado = {
                nombre,
                tipo_pago,
                pago_unitario,
                tipo_empleado,
                estado: 'activo',
            };

            try {
                Swal.showLoading();
                const btn = Swal.getConfirmButton();
                btn.disabled = true;
                await window.api.post('empleados', nuevoEmpleado);
                Swal.fire('¡Listo!', 'Empleado registrado con éxito.', 'success');
                cargarEmpleados();
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudo guardar el empleado.', 'error');
            }
        }
    });
}


function editarEmpleado(emp) {
    Swal.fire({
        title: 'Editar Empleado',
        html: `
            <div class="space-y-4 text-left w-full max-w-md mx-auto">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" id="nombre" class="campo-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none" value="${emp.nombre}">
                    <p id="error-nombre" class="text-red-600 text-xs mt-1 hidden">Este campo es obligatorio</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo de pago</label>
                    <select id="tipo_pago" class="campo-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none">
                        <option value="por hora" ${emp.tipo_pago === 'por hora' ? 'selected' : ''}>Por hora</option>
                        <option value="por día" ${emp.tipo_pago === 'por día' ? 'selected' : ''}>Por día</option>
                    </select>
                    <p id="error-tipo_pago" class="text-red-600 text-xs mt-1 hidden">Selecciona una opción</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Pago unitario</label>
                    <input type="number" id="pago_unitario" class="campo-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none" value="${emp.pago_unitario}">
                    <p id="error-pago_unitario" class="text-red-600 text-xs mt-1 hidden">Debe ser un número válido</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo de empleado</label>
                    <select id="tipo_empleado" class="campo-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                        onchange="document.getElementById('otro_empleado_edit').style.display = this.value === 'Otro' ? 'block' : 'none'">
                        <option value="Costurero" ${emp.tipo_empleado === 'Costurero' ? 'selected' : ''}>Costurero</option>
                        <option value="Manual" ${emp.tipo_empleado === 'Manual' ? 'selected' : ''}>Manual</option>
                        <option value="Encargado" ${emp.tipo_empleado === 'Encargado' ? 'selected' : ''}>Encargado</option>
                        <option value="Otro" ${!['Costurero', 'Manual', 'Encargado'].includes(emp.tipo_empleado) ? 'selected' : ''}>Otro</option>
                    </select>
                    <p id="error-tipo_empleado" class="text-red-600 text-xs mt-1 hidden">Selecciona un tipo válido</p>
                </div>

                <div id="otro_empleado_edit" style="display:${!['Costurero', 'Manual', 'Encargado'].includes(emp.tipo_empleado) ? 'block' : 'none'};">
                    <label class="block text-sm font-medium text-gray-700">Especificar tipo</label>
                    <input type="text" class="campo-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none" value="${emp.tipo_empleado}">
                    <p id="error-otro_empleado" class="text-red-600 text-xs mt-1 hidden">Este campo es obligatorio</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="estado" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none">
                        <option value="activo" ${emp.estado === 'activo' ? 'selected' : ''}>Activo</option>
                        <option value="inactivo" ${emp.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>

                <div class="text-sm mt-2">
                    Huella: ${emp.codigo_huella ? `
                        Registrada <button onclick="eliminarHuella('${emp.id}', '${emp.nombre.replace(/'/g, "\\'")}')" class="text-red-600 underline ml-2">Eliminar</button>
                    ` : 'No registrada'}

                </div>
            </div>
        `,
        confirmButtonText: 'Guardar cambios',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: async () => {
            const nombre = document.getElementById('nombre').value.trim();
            const tipo_pago = document.getElementById('tipo_pago').value;
            const pago_unitario = document.getElementById('pago_unitario').value.trim();
            let tipo_empleado = document.getElementById('tipo_empleado').value;
            const otro = document.querySelector('#otro_empleado_edit input')?.value.trim();
            const estado = document.getElementById('estado').value;

            let hayError = false;
            document.querySelectorAll('.campo-input').forEach(el => {
                el.classList.remove('border-red-600', 'ring-1', 'ring-red-600');
            });
            document.querySelectorAll('[id^="error-"]').forEach(p => p.classList.add('hidden'));

            if (!nombre) {
                document.getElementById('nombre').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-nombre').classList.remove('hidden');
                hayError = true;
            }
            if (!tipo_pago) {
                document.getElementById('tipo_pago').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-tipo_pago').classList.remove('hidden');
                hayError = true;
            }
            if (!pago_unitario || isNaN(pago_unitario) || Number(pago_unitario) <= 0) {
                document.getElementById('pago_unitario').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-pago_unitario').classList.remove('hidden');
                hayError = true;
            }
            if (!tipo_empleado) {
                document.getElementById('tipo_empleado').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                document.getElementById('error-tipo_empleado').classList.remove('hidden');
                hayError = true;
            }
            if (tipo_empleado === 'Otro') {
                if (!otro) {
                    document.querySelector('#otro_empleado_edit input').classList.add('border-red-600', 'ring-1', 'ring-red-600');
                    document.getElementById('error-otro_empleado').classList.remove('hidden');
                    hayError = true;
                } else {
                    tipo_empleado = otro;
                }
            }

            if (hayError) return false;

            const datosActualizados = {
                nombre,
                tipo_pago,
                pago_unitario,
                tipo_empleado,
                estado
            };

            try {
                Swal.showLoading();
                await window.api.post(`empleados/${emp.id}`, datosActualizados);
                Swal.fire('Actualizado', 'El empleado fue actualizado correctamente.', 'success');
                cargarEmpleados();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo actualizar el empleado.', 'error');
            }
        }
    });
}


function eliminarHuella(idEmpleado, nombreEmpleado) {
    Swal.fire({
        title: '¿Eliminar huella?',
        html: `Esta acción eliminará la huella registrada para el empleado <strong>${nombreEmpleado}</strong>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await window.api.post(`empleados/${idEmpleado}/eliminar-huella`);
                Swal.fire({
                    icon: 'success',
                    title: 'Huella eliminada',
                    html: `La huella del empleado <strong>${nombreEmpleado}</strong> ha sido eliminada correctamente.`
                });
                cargarEmpleados();
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar',
                    html: `No se pudo eliminar la huella del empleado <strong>${nombreEmpleado}</strong>.`
                });
            }
        }
    });
}


document.querySelectorAll('#tablaEmpleados thead th').forEach((th, index) => {
    th.style.cursor = 'pointer';

    th.addEventListener('click', () => {
        const columnas = ['nombre', 'tipo_pago', 'pago_unitario', 'tipo_empleado', 'codigo_huella', 'created_at', 'updated_at', 'estado'];
        const clave = columnas[index];
        if (!clave) return;

        if (columnaOrdenActual === clave) {
            ordenAscendente = !ordenAscendente;
        } else {
            columnaOrdenActual = clave;
            ordenAscendente = true;
        }

        renderizarTabla();
        actualizarEncabezados();
    });
});

function actualizarEncabezados() {
    const ths = document.querySelectorAll('#tablaEmpleados thead th');
    const columnas = ['nombre', 'tipo_pago', 'pago_unitario', 'tipo_empleado', 'codigo_huella', 'created_at', 'updated_at', 'estado'];

    ths.forEach((th, index) => {
        const clave = columnas[index];
        if (!clave) return;

        // Recuperamos solo el texto base del encabezado (sin flechas acumuladas)
        const textoBase = th.textContent.replace(/[\u25B2\u25BC]/g, '').trim(); // ▲ = U+25B2, ▼ = U+25BC

        if (clave === columnaOrdenActual) {
            const flecha = ordenAscendente ? ' ▲' : ' ▼';
            th.innerHTML = textoBase + flecha;
        } else {
            th.innerHTML = textoBase;
        }
    });
}
