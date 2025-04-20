document.addEventListener('DOMContentLoaded', () => {
    // Actualiza hora y fecha actual en pantalla
    function formatearFechaHora() {
        const ahora = new Date();
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaHora = document.getElementById('fechaHora');
        if (fechaHora) {
            fechaHora.textContent =
                ahora.toLocaleDateString('es-MX', opciones) + ' - ' + ahora.toLocaleTimeString('es-MX');
        }
    }

    setInterval(formatearFechaHora, 1000);
    formatearFechaHora();

    // Mostrar resumen semanal
    async function cargarResumenAsistencia() {
        try {
            const response = await window.api.get('asistencias-semana');
            const data = response.data;

            const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
            const tabla = document.getElementById('asistenciaBody');
            if (!tabla) return;

            tabla.innerHTML = '';

            data.forEach(empleado => {
                const tr = document.createElement('tr');
                tr.className = 'border-b';

                tr.innerHTML = `<td class="px-4 py-2 font-medium">${empleado.nombre}</td>` +
                    dias.map(d => `<td class="px-4 py-2 text-center">${empleado[d] ?? '-'}</td>`).join('');

                tabla.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cargar el resumen semanal.', 'error');
        }
    }

    // Cargar lista de empleados al dar clic (si usas esta funcionalidad aún)
    const btn = document.getElementById('btn-cargar-empleados');
    if (btn) {
        btn.addEventListener('click', async () => {
            try {
                const response = await window.api.get('empleados');
                const empleados = response.data;

                const container = document.getElementById('empleados-container');
                if (!container) return;

                container.innerHTML = '';

                if (empleados.length === 0) {
                    Swal.fire('Sin empleados', 'No hay empleados registrados.', 'info');
                    return;
                }

                empleados.forEach(emp => {
                    const div = document.createElement('div');
                    div.className = 'bg-white shadow-md rounded p-4';
                    div.innerHTML = `
                        <h2 class="text-lg font-semibold">${emp.nombre ?? 'Sin nombre'}</h2>
                        <p><strong>Tipo de pago:</strong> ${emp.tipo_pago ?? '-'}</p>
                        <p><strong>Pago unitario:</strong> $${emp.pago_unitario ?? '-'}</p>
                        <p><strong>Tipo de empleado:</strong> ${emp.tipo_empleado ?? '-'}</p>
                    `;
                    container.appendChild(div);
                });

            } catch (error) {
                console.error('Error al obtener empleados:', error);
                Swal.fire('Error', 'No se pudo obtener la lista de empleados.', 'error');
            }
        });
    }

    cargarResumenAsistencia();
});
