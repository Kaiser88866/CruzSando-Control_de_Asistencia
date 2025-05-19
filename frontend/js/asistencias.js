const contenedor = document.getElementById("contenedorAsistencias");
const semanaInput = document.getElementById("selectorSemana");

document.addEventListener("DOMContentLoaded", () => {

    // Establecer semana actual
    const hoy = new Date();

    window.registrarManual = async function registrarManual(id_empleado, fecha) {
        const { value: formValues } = await Swal.fire({
            title: 'Registrar asistencia',
            html: `
                <label class="block mb-1 text-left">Hora entrada</label>
                <input type="time" id="hora_entrada" class="swal2-input">
                <label class="block mb-1 text-left">Hora salida (opcional)</label>
                <input type="time" id="hora_salida" class="swal2-input">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Registrar",
            preConfirm: () => {
                return {
                    hora_entrada: document.getElementById('hora_entrada').value,
                    hora_salida: document.getElementById('hora_salida').value
                };
            }
        });

        if (!formValues) return;

        try {
            const { hora_entrada, hora_salida } = formValues;
            let horas_trabajadas = null;

            if (hora_entrada && hora_salida) {
                const inicio = new Date(`2000-01-01T${hora_entrada}`);
                const fin = new Date(`2000-01-01T${hora_salida}`);
                const diff = (fin - inicio) / (1000 * 60 * 60); // en horas
                horas_trabajadas = parseFloat(diff.toFixed(2));
            }

            await window.api.post("asistencia", {
                id_empleado,
                fecha,
                hora_entrada,
                hora_salida: hora_salida || null,
                horas_trabajadas
            });

            Swal.fire("¡Listo!", "Asistencia registrada", "success");
            cargarAsistencias(document.getElementById("selectorSemana").value);
        } catch (error) {
            console.error("Error al registrar:", error);
            Swal.fire("Error", "No se pudo registrar la asistencia", "error");
        }
    }

    window.editarAsistencia = async function editarAsistencia(asistencia) {
        const { value: formValues } = await Swal.fire({
            title: 'Editar asistencia',
            html: `
                <label class="block mb-1 text-left">Hora entrada</label>
                <input type="time" id="hora_entrada" class="swal2-input" value="${asistencia.hora_entrada}">
                <label class="block mb-1 text-left">Hora salida</label>
                <input type="time" id="hora_salida" class="swal2-input" value="${asistencia.hora_salida || ''}">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Actualizar",
            preConfirm: () => {
                return {
                    hora_entrada: document.getElementById('hora_entrada').value,
                    hora_salida: document.getElementById('hora_salida').value
                };
            }
        });

        if (!formValues) return;

        try {
            const { hora_entrada, hora_salida } = formValues;
            let horas_trabajadas = null;

            if (hora_entrada && hora_salida) {
                const inicio = new Date(`2000-01-01T${hora_entrada}`);
                const fin = new Date(`2000-01-01T${hora_salida}`);
                const diff = (fin - inicio) / (1000 * 60 * 60);
                horas_trabajadas = parseFloat(diff.toFixed(2));
            }

            await window.api.put(`asistencia/${asistencia.id}`, {
                hora_entrada,
                hora_salida: hora_salida || null,
                horas_trabajadas
            });

            Swal.fire("Actualizado", "La asistencia fue modificada", "success");
            cargarAsistencias(document.getElementById("selectorSemana").value);
        } catch (error) {
            console.error("Error al editar:", error);
            Swal.fire("Error", "No se pudo actualizar", "error");
        }
    }









    let ultimoTextoSemana = "";
    let ultimaSemana = { inicio: null, fin: null };

    const picker = new Litepicker({
        element: semanaInput,
        singleMode: false,
        numberOfColumns: 1,
        numberOfMonths: 1,
        lang: 'es',
        format: 'YYYY-MM-DD',
        showWeekNumbers: true,
        showDaysOutsideMonth: true,
        weekStart: 1,
        autoApply: true,
        dropdowns: {
            minYear: 2023,
            maxYear: new Date().getFullYear() + 1,
            months: true,
            years: true
        },
        setup: (picker) => {
            picker.on('selected', (start) => {
                const fecha = new Date(start.format('YYYY-MM-DD'));
                const [inicio, fin] = obtenerRangoSemanaDesdeFecha(fecha);

                picker.setDateRange(inicio, fin); // selecciona automáticamente la semana

                semanaInput.value = formatearTextoSemana(inicio, fin);
                semanaInput.dataset.inicio = inicio;
                semanaInput.dataset.fin = fin;

                cargarAsistenciasConFechas(inicio, fin);
            });

            picker.on('hide', () => {
                if (!semanaInput.value && semanaInput.dataset.inicio && semanaInput.dataset.fin) {
                    semanaInput.value = formatearTextoSemana(
                        semanaInput.dataset.inicio,
                        semanaInput.dataset.fin
                    );
                }
            });
        }
    });





    const [inicio, fin] = obtenerRangoSemanaDesdeFecha(new Date());
    cargarAsistenciasConFechas(inicio, fin);
});

function formatearDiaSemana(fecha) {
    return fecha.toLocaleDateString("es-MX", { weekday: 'long' });
}

function obtenerColorRegistro(r, hoyISO) {
    const tieneEntrada = !!r.hora_entrada;
    const tieneSalida = !!r.hora_salida;
    const esHoy = r.fecha === hoyISO;

    if (tieneEntrada && tieneSalida) return "text-green-600 font-medium";
    if (!tieneEntrada || !tieneSalida) {
        return esHoy ? "text-orange-500 font-medium" : "text-red-600 font-medium";
    }
    return "";
}

function obtenerRangoSemanaDesdeFecha(fecha) {
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia; // Si es domingo (-6), si es martes (-1), etc.
    const inicio = new Date(fecha);
    inicio.setDate(fecha.getDate() + diferencia);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    return [formatearFechaISO(inicio), formatearFechaISO(fin)];
}


function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-MX", {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatearFechaISO(fechaObj) {
    return fechaObj.toISOString().slice(0, 10);
}

function esSemanaActual(inicio, fin) {
    const hoyISO = formatearFechaISO(new Date());
    return hoyISO >= inicio && hoyISO <= fin;
}

function getISOWeek(date) {
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    return 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

async function cargarAsistenciasConRango(inicioSemana, finSemana) {
    contenedor.innerHTML = "";

    const semanaActual = esSemanaActual(inicioSemana, finSemana);
    const hoy = new Date();
    const hoyISO = formatearFechaISO(hoy);

    try {
        const resEmpleados = await window.api.get("empleados");
        const todosLosEmpleados = resEmpleados.data;
        const empleadosActivos = todosLosEmpleados.filter(e => e.estado === 'activo');

        const resAsistencias = await window.api.get(`asistencias/semana?inicio=${inicioSemana}&fin=${finSemana}`);
        const asistencias = resAsistencias.data;

        empleadosActivos
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .forEach(emp => {
                const asistenciasEmpleado = asistencias.filter(a => a.id_empleado === emp.id);
                const diasAgrupados = agruparPorDia(asistenciasEmpleado);

                const entradasHoy = asistenciasEmpleado.filter(a => a.fecha === hoyISO && a.hora_entrada);
                const entradaDelDia = entradasHoy.length > 0 ? entradasHoy[0].hora_entrada : null;

                const encabezado = `
                <div class="flex items-center space-x-2">
                    <span class="font-semibold">👤 ${emp.nombre}</span>
                    <span class="text-sm text-gray-600">
                    📅 ${formatearDiaSemana(hoy)}, ${formatearFecha(hoyISO)} -
                    ${entradaDelDia
                        ? `<span class="text-green-600 font-semibold">Entrada ${entradaDelDia}</span>`
                        : `<span class="text-red-600 font-semibold">Entrada no registrada</span>`
                    }
                    </span>
                </div>`;

                const contenido = generarTablaDias(diasAgrupados, inicioSemana, emp);

                const accordion = document.createElement("details");
                accordion.className = "bg-white shadow rounded";
                accordion.innerHTML = `
                <summary class="px-4 py-2 cursor-pointer border-b">${encabezado}</summary>
                <div class="p-4 overflow-auto">${contenido}</div>
            `;
                contenedor.appendChild(accordion);
            });

    } catch (err) {
        console.error("Error cargando asistencias:", err);
        Swal.fire("Error", "No se pudieron cargar las asistencias", "error");
    }
}

// Cargar asistencias al iniciar
window.cargarAsistenciasConFechas = function (inicioSemana, finSemana) {
    const semanaInput = document.getElementById("selectorSemana");
    semanaInput.value = formatearTextoSemana(inicioSemana, finSemana);

    // llama a la función original pero pasando las fechas
    cargarAsistenciasConRango(inicioSemana, finSemana);
}

function obtenerRangoSemana(semanaStr) {
    const [año, semana] = semanaStr.split("-W");
    const fechaInicio = new Date(año, 0, 1 + (semana - 1) * 7);
    const diaInicio = fechaInicio.getDay();
    const inicioLunes = new Date(fechaInicio);
    inicioLunes.setDate(fechaInicio.getDate() - ((diaInicio + 6) % 7));
    const finDomingo = new Date(inicioLunes);
    finDomingo.setDate(inicioLunes.getDate() + 6);
    return [formatearFechaISO(inicioLunes), formatearFechaISO(finDomingo)];
}

function obtenerPrimerEntrada(asistencias) {
    const ordenadas = [...asistencias].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_entrada.localeCompare(b.hora_entrada));
    return ordenadas[0] || null;
}

function agruparPorDia(asistencias) {
    const mapa = {};
    asistencias.forEach(a => {
        if (!mapa[a.fecha]) mapa[a.fecha] = [];
        mapa[a.fecha].push(a);
    });
    return mapa;
}

function formatoHorasDecimales(decimal) {
    const horas = Math.floor(decimal);
    const minutos = Math.round((decimal - horas) * 60);
    const hh = String(horas).padStart(2, '0');
    const mm = String(minutos).padStart(2, '0');
    return `${hh}:${mm}`;
}

function calcularHorasTexto(hora_entrada, hora_salida) {
    const inicio = new Date(`2000-01-01T${hora_entrada}`);
    const fin = new Date(`2000-01-01T${hora_salida}`);
    const diffMs = fin - inicio;
    const totalMinutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function getWeekString(fecha) {
    const año = fecha.getFullYear();
    const semana = new Date(fecha.getTime() - fecha.getDay() * 86400000); // lunes de esta semana
    const isoWeek = semana.toISOString().slice(0, 10).split("-");
    return `${isoWeek[0]}-W${('0' + getISOWeek(fecha)).slice(-2)}`;
}

function generarTablaDias(diasAgrupados, inicioSemana, emp) {
    const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const inicio = new Date(inicioSemana);
    const hoyISO = formatearFechaISO(new Date());

    let html = `
    <table class="min-w-full text-sm border rounded">
        <thead class="bg-gray-200 text-center">
            <tr>
                <th class="px-3 py-1 border">Día</th>
                <th class="px-3 py-1 border">Entrada</th>
                <th class="px-3 py-1 border">Salida</th>
                <th class="px-3 py-1 border">Acciones</th>
                <th class="px-3 py-1 border">Horas</th>
                <th class="px-3 py-1 border">Total de horas</th>
                <th class="px-3 py-1 border">Añadir Entrada/Salida</th>
            </tr>
        </thead>
        <tbody>`;

    for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicio);
        fecha.setDate(inicio.getDate() + i);
        const fechaStr = formatearFechaISO(fecha);
        const nombreDia = diasNombres[i];
        const registros = diasAgrupados[fechaStr] || [];

        if (registros.length > 0) {
            const totalDecimal = registros.reduce((acc, r) => acc + parseFloat(r.horas_trabajadas || 0), 0);

            registros.forEach((r, index) => {
                const primeraFila = index === 0;
                const horasFormateadas = r.horas_trabajadas ? formatoHorasDecimales(parseFloat(r.horas_trabajadas)) : "-";
                const colorClase = obtenerColorRegistro(r, hoyISO);

                html += `
                <tr>
                    ${primeraFila ? `<td class="border px-2 py-1 text-center align-middle" rowspan="${registros.length}">${nombreDia}</td>` : ""}
                    
                    <td class="border px-2 py-1 text-center ${colorClase}">${r.hora_entrada || "_"}</td>
                    <td class="border px-2 py-1 text-center ${colorClase}">${r.hora_salida || "_"}</td>

                    <td class="border px-2 py-1 text-center">
                        <button onclick='editarAsistencia(${JSON.stringify(r)})' class="text-yellow-600 hover:text-yellow-800">✏️</button>
                        <button onclick='eliminarAsistencia(${r.id})' class="text-red-600 hover:text-red-800">🗑️</button>
                    </td>

                    <td class="border px-2 py-1 text-center">${horasFormateadas}</td>

                    ${primeraFila ? `
                        <td class="border px-2 py-1 text-center font-semibold align-middle" rowspan="${registros.length}">
                            ${formatoHorasDecimales(totalDecimal)} hr
                        </td>
                        <td class="border px-2 py-1 text-center align-middle" rowspan="${registros.length}">
                            <button onclick="registrarManual(${emp.id}, '${fechaStr}')" class="text-xl text-green-600 hover:text-green-800">➕</button>
                        </td>
                    ` : `
                    `}
                </tr>`;
            });

        } else {
            html += `
            <tr>
                <td class="border px-2 py-1 text-center">${nombreDia}</td>
                <td class="border px-2 py-1 text-center">--</td>
                <td class="border px-2 py-1 text-center">--</td>
                <td class="border px-2 py-1 text-center">--</td>
                <td class="border px-2 py-1 text-center">--</td>
                <td class="border px-2 py-1 text-center font-semibold">00:00 hr</td>
                <td class="border px-2 py-1 text-center">
                    <button onclick="registrarManual(${emp.id}, '${fechaStr}')" class="text-xl text-green-600 hover:text-green-800">➕</button>
                </td>
            </tr>`;
        }
    }

    html += `</tbody></table>`;
    return html;
}

function formatearTextoSemana(inicioISO, finISO) {
    const inicio = new Date(inicioISO);
    const fin = new Date(finISO);

    const semana = getISOWeek(inicio);
    const opciones = { day: '2-digit', month: 'long' };

    const inicioStr = inicio.toLocaleDateString('es-MX', opciones);
    const finStr = fin.toLocaleDateString('es-MX', opciones);

    return `Semana ${semana} · ${inicioStr} al ${finStr}`;
}

