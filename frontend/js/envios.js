let envioActual = null;
let contadorPaquete = 1;
let descripcionesUnicas = [];

function obtenerFechaLocalHoy() {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset(); // en minutos
    const fechaLocal = new Date(ahora.getTime() - offset * 60000);
    return fechaLocal.toISOString().split("T")[0];
}

async function cargarDescripcionesUnicas() {
    try {
        const response = await window.api.get("prendas_envio");
        const todas = response.data.map(p => p.descripcion?.trim()).filter(Boolean);
        descripcionesUnicas = [...new Set(todas)]; // elimina duplicados
    } catch (error) {
        console.error("Error al obtener descripciones:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarDatosEnvio();
    await cargarEnvios();
    await cargarDatosTraslado();
});


// Mostrar datos generales del envío (si existe)
async function cargarDatosEnvio() {
    try {
        const response = await window.api.get("envios");
        if (response.data.length === 0) {
            envioActual = null;
            document.getElementById("bloqueDatosCombinados").classList.add("hidden");
            document.getElementById("noDatosEnvio").classList.remove("hidden");
        } else {
            envioActual = response.data[response.data.length - 1];
            document.getElementById("noDatosEnvio").classList.add("hidden");

            // Mostrar datos del envío
            document.getElementById("envio-empresa").innerText = envioActual.empresa_destino;
            document.getElementById("envio-recolectora").innerText = envioActual.persona_recolectora;
            document.getElementById("envio-direccion").innerText = envioActual.direccion_envio;
            document.getElementById("envio-fecha").innerText = envioActual.created_at.split("T")[0];

            // Mostrar bloque general
            document.getElementById("bloqueDatosCombinados").classList.remove("hidden");

            // Cargar traslado
            await cargarDatosTraslado();
        }
    } catch (error) {
        console.error("Error al cargar datos de envío:", error);
    }
}


// Mostrar acordeones de envíos → paquetes → prendas
async function cargarEnvios() {
    try {
        const prendas = await window.api.get("prendas_envio");
        const contenedor = document.getElementById("acordeonEnvios");

        if (prendas.data.length === 0) {
            document.getElementById("noEnvios").classList.remove("hidden");
            contenedor.innerHTML = "";
            return;
        }

        document.getElementById("noEnvios").classList.add("hidden");

        const agrupadoPorFecha = {};

        prendas.data.forEach((item) => {
            const fecha = item.created_at.split("T")[0];
            if (!agrupadoPorFecha[fecha]) agrupadoPorFecha[fecha] = {};
            if (!agrupadoPorFecha[fecha][item.paquete]) agrupadoPorFecha[fecha][item.paquete] = [];
            agrupadoPorFecha[fecha][item.paquete].push(item);
        });

        const fechasOrdenadas = Object.keys(agrupadoPorFecha).sort((a, b) => new Date(b) - new Date(a));

        let html = ``;

        fechasOrdenadas.forEach((fecha) => {
            const paquetes = agrupadoPorFecha[fecha];
            const fechaFormateada = formatearFechaCompleta(fecha);

            html += `
                <details class="rounded-lg shadow-md border border-gray-200 bg-white transition-all">
                <summary class="font-semibold text-lg px-4 py-3 flex items-center justify-between cursor-pointer">
                    <span>📦 Envío del <span class="text-blue-600 font-bold">${fechaFormateada}</span></span>
                    <svg class="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>

                <div class="border-t border-gray-200 px-4 py-3 space-y-4">
                    <div class="flex flex-wrap justify-between items-center gap-2">
                    <div class="flex gap-2">
                        <button class="btn-pdf bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
                        data-fecha="${fecha}" 
                        data-paquete='${encodeURIComponent(JSON.stringify(paquetes))}'>
                        🧾 Generar Etiquetas
                        </button>
                        <button onclick="generarResumenPDF('${fecha}')" 
                        class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm">
                        📊 Generar Resumen de Envío
                        </button>
                    </div>
                    <div>
                        <button onclick="editarModalPaquetes('${fecha}')" 
                        class="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 text-sm">
                        ✏️ Editar Envío
                        </button>
                    </div>
                    </div>

                `;


            Object.entries(paquetes).forEach(([num, prendas]) => {
                html += `
                    <details class="bg-gray-50 rounded-md border border-gray-300 p-3 shadow-sm">
                      <summary class="text-gray-700 font-medium cursor-pointer mb-2">📦 Paquete <strong>${num}</strong></summary>
                      <div class="overflow-x-auto rounded-lg">
                        <table class="min-w-full text-sm text-left border border-gray-300 shadow-sm bg-white">
                          <thead class="bg-blue-100 text-gray-800 uppercase text-xs">
                            <tr>
                              <th class="px-4 py-2 border">Descripción</th>
                              <th class="px-4 py-2 border">Talla</th>
                              <th class="px-4 py-2 border">Cantidad</th>
                              <th class="px-4 py-2 border">Número de corte</th>
                            </tr>
                          </thead>
                          <tbody>
                    `;

                prendas.forEach((p) => {
                    html += `
                            <tr class="hover:bg-gray-100 transition-colors">
                              <td class="px-4 py-2 border">${p.descripcion}</td>
                              <td class="px-4 py-2 border">${p.talla}</td>
                              <td class="px-4 py-2 border">${p.cantidad}</td>
                              <td class="px-4 py-2 border">${p.numero_corte}</td>
                            </tr>
                        `;
                });

                html += `
                          </tbody>
                        </table>
                      </div>
                    </details>`;
            });


            html += `</div></details>`;
        });

        contenedor.innerHTML = html;

        // Delegación de evento para botones PDF
        setTimeout(() => {
            document.querySelectorAll(".btn-pdf").forEach(btn => {
                btn.addEventListener("click", () => {
                    const fecha = btn.getAttribute("data-fecha");
                    const paquetes = JSON.parse(decodeURIComponent(btn.getAttribute("data-paquete")));
                    generarEtiquetaPDF(fecha, paquetes); // ✅ paquetes debe estar en formato: { 1: [...], 2: [...] }
                });
            });
        }, 0);

    } catch (error) {
        console.error("Error al cargar prendas:", error);
    }
}



// Modal: Registrar nuevo envío
function abrirModalEnvio() {
    Swal.fire({
        title: "Registrar Envío",
        html: `
      <input type="text" id="empresa" class="swal2-input" placeholder="Empresa destino">
      <input type="text" id="persona" class="swal2-input" placeholder="Persona recolectora">
      <input type="text" id="direccion" class="swal2-input" placeholder="Dirección de envío">
    `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        preConfirm: async () => {
            const dueno = document.getElementById("dueno").value.trim();
            const empresa = document.getElementById("transportista").value.trim();
            const lugar = document.getElementById("lugar").value.trim();
            const clave = document.getElementById("clave").value.trim();

            if (!dueno || !empresa || !lugar || !clave) {
                Swal.showValidationMessage("Completa todos los campos");
                return false;
            }

            await window.api.post("datos_traslado", {
                envio_id: envioActual.id,
                dueno,
                empresa_transportista: empresa,
                lugar_entrega: lugar,
                clave_producto_sat: clave,
            });

            await cargarDatosEnvio();
        },
    });
}

// Modal: Editar envío actual
function editarModalEnvio() {
    if (!envioActual) return Swal.fire("Sin datos", "No hay un envío que editar", "info");

    Swal.fire({
        title: "Editar Envío",
        html: `
      <input type="text" id="empresa" class="swal2-input" value="${envioActual.empresa_destino}">
      <input type="text" id="persona" class="swal2-input" value="${envioActual.persona_recolectora}">
      <input type="text" id="direccion" class="swal2-input" value="${envioActual.direccion_envio}">
    `,
        showCancelButton: true,
        confirmButtonText: "Actualizar",
        preConfirm: async () => {
            const empresa = document.getElementById("empresa").value;
            const persona = document.getElementById("persona").value;
            const direccion = document.getElementById("direccion").value;

            if (!empresa || !persona || !direccion) {
                Swal.showValidationMessage("Completa todos los campos");
                return false;
            }

            await window.api.put(`envios/${envioActual.id}`, {
                empresa_destino: empresa,
                persona_recolectora: persona,
                direccion_envio: direccion,
            });

            await cargarDatosEnvio();

            // 🎉 Alerta de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Datos actualizados!',
                text: 'Los datos del envío fueron modificados correctamente.',
                timer: 2500,
                showConfirmButton: false
            });
        },
    });
}

async function abrirModalPaquetes() {
    await cargarDescripcionesUnicas(); // Asegúrate de tener datos antes de crear el modal

    let paqueteCount = 1;
    let paquetes = [{ prendas: [{}] }];
    let fechaCreacionGlobal = obtenerFechaLocalHoy();

    function crearFormularioPrendaHTML(paqueteIndex, prendaIndex) {
        return `
        <div class="mb-4 border border-gray-300 p-3 rounded bg-white relative">
          <label class="block mb-1 font-semibold">Descripción</label>
          <div class="relative">
            <input 
                type="text" 
                name="descripcion-${paqueteIndex}-${prendaIndex}" 
                class="w-full border px-3 py-2 rounded mb-1 descripcion-input" 
                placeholder="Descripción de la bata/filipina"
                autocomplete="off"
                data-paquete="${paqueteIndex}" data-prenda="${prendaIndex}"
            >
            <ul class="sugerencias-box hidden" id="sugerencias-${paqueteIndex}-${prendaIndex}"></ul>
            </div>



          <div class="flex gap-2 mb-1">
            <select name="talla-${paqueteIndex}-${prendaIndex}" class="border border-gray-400 px-2 py-1 rounded w-1/3">
              <option value="" disabled selected hidden>Elija alguna talla</option>
              <option>XS</option><option>S</option><option>M</option><option>L</option>
              <option>XL</option><option>2XL</option><option>3XL</option><option>4XL</option><option>5XL</option>
              <option>Varias</option>
            </select>
            <input type="number" name="cantidad-${paqueteIndex}-${prendaIndex}" class="border px-3 py-1 rounded w-1/3 cantidad-input" placeholder="Cantidad" min="1">
            <input type="text" name="corte-${paqueteIndex}-${prendaIndex}" class="border px-3 py-1 rounded w-1/3" placeholder="No. Corte">
          </div>
          <p class="text-xs text-red-500 hidden aviso-decimales mt-1">No se permiten números decimales.</p>
        </div>
      `;
    }

    function crearFormularioPaquete(num) {
        return `
        <details open class="mb-4 border rounded bg-gray-50 paquete-animado" id="paquete-${num}">
          <summary class="bg-gray-200 px-4 py-2 font-bold cursor-pointer">Paquete ${num}</summary>
          <div class="p-4 space-y-3" id="contenedor-prendas-${num}">
            ${crearFormularioPrendaHTML(num, 0)}
          </div>
          <button type="button" data-paquete="${num}" class="agregar-prenda-btn bg-indigo-600 text-white px-3 py-1 rounded mt-2">Agregar prenda</button>
        </details>
      `;
    }

    Swal.fire({
        title: 'Añadir Envío (Paquetes)',
        html: `
        <div class="mb-4 bg-white p-3 rounded shadow border">
          <label class="font-semibold block mb-1">Fecha de creación</label>
          <div class="flex items-center gap-3">
            <span id="fecha-creacion-texto" class="text-gray-800 font-medium">${formatearFechaBonita(fechaCreacionGlobal)}</span>
            <button id="editar-fecha" class="text-blue-600 underline text-sm">Editar fecha</button>
          </div>
          <input type="date" id="input-fecha" value="${fechaCreacionGlobal}" class="mt-2 hidden border px-3 py-1 rounded" />
        </div>

        <div id="contenedor-paquetes">${crearFormularioPaquete(1)}</div>

        <div id="mensaje-errores" class="hidden text-red-600 font-semibold text-sm mb-3"></div>

        <div class="flex justify-between mt-4 items-center">
          <button id="agregar-paquete" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Agregar Paquete</button>
          <div class="flex gap-2 items-center">
            <button id="cancelar" class="bg-red-500 text-white px-4 py-2 rounded">Cancelar</button>
            <button id="guardar-todo" class="bg-green-600 text-white px-4 py-2 rounded">Guardar Todos</button>
          </div>
        </div>

        <div id="barra-progreso-container" class="mt-4 hidden">
            <p class="text-sm text-gray-600 mb-1">Guardando datos...</p>
            <div class="w-full bg-gray-300 rounded h-3 overflow-hidden">
              <div id="barra-progreso" class="bg-green-500 h-3 w-0 transition-all duration-200"></div>
            </div>
        </div>

        <datalist id="opciones-descripciones">
            ${descripcionesUnicas.map(desc => `<option value="${desc}">`).join("")}
        </datalist>
      `,
        width: '70rem',
        showConfirmButton: false,
        didOpen: () => {

            const container = document.getElementById('contenedor-paquetes');

            document.getElementById('editar-fecha').addEventListener('click', () => {
                document.getElementById('input-fecha').classList.toggle('hidden');
            });

            document.getElementById('input-fecha').addEventListener('change', (e) => {
                fechaCreacionGlobal = e.target.value;
                document.getElementById('fecha-creacion-texto').innerText = formatearFechaBonita(fechaCreacionGlobal);
            });

            document.getElementById('agregar-paquete').addEventListener('click', () => {
                paqueteCount++;
                paquetes.push({ prendas: [{}] });
                container.insertAdjacentHTML('beforeend', crearFormularioPaquete(paqueteCount));
            });

            document.getElementById('cancelar').addEventListener('click', () => Swal.close());

            document.getElementById('guardar-todo').addEventListener('click', async () => {
                const datosAEnviar = [];
                let errores = [];
                let primerError = null;

                document.getElementById("guardar-todo").classList.add("hidden");
                document.getElementById("cancelar").classList.add("hidden");
                document.getElementById("barra-progreso-container").classList.remove("hidden");

                for (let pIndex = 0; pIndex < paquetes.length; pIndex++) {
                    const paqueteNum = pIndex + 1;
                    const contenedor = document.getElementById(`contenedor-prendas-${paqueteNum}`);
                    const prendas = contenedor.querySelectorAll('div.mb-4');

                    for (let prendaIndex = 0; prendaIndex < prendas.length; prendaIndex++) {
                        const div = prendas[prendaIndex];
                        const desc = div.querySelector(`[name="descripcion-${paqueteNum}-${prendaIndex}"]`);
                        const talla = div.querySelector(`[name="talla-${paqueteNum}-${prendaIndex}"]`);
                        const cantidad = div.querySelector(`[name="cantidad-${paqueteNum}-${prendaIndex}"]`);
                        const corte = div.querySelector(`[name="corte-${paqueteNum}-${prendaIndex}"]`);
                        const avisoDecimal = div.querySelector('.aviso-decimales');

                        [desc, talla, cantidad, corte].forEach(i => i.classList.remove("border-red-500"));
                        avisoDecimal.classList.add("hidden");

                        let hayError = false;

                        if (!desc.value.trim()) {
                            desc.classList.add("border-red-500");
                            div.closest("details").open = true;
                            hayError = true;
                        }

                        if (!talla.value) {
                            talla.classList.add("border-red-500");
                            div.closest("details").open = true;
                            hayError = true;
                        }

                        if (!cantidad.value || isNaN(cantidad.value)) {
                            cantidad.classList.add("border-red-500");
                            div.closest("details").open = true;
                            hayError = true;
                        } else {
                            const num = parseFloat(cantidad.value);
                            const esDecimal = num % 1 !== 0;

                            if (esDecimal) {
                                cantidad.classList.add("border-red-500");
                                avisoDecimal.classList.remove("hidden");
                                div.closest("details").open = true;
                                hayError = true;
                            } else if (/^0[0-9]+/.test(cantidad.value)) {
                                cantidad.classList.add("border-red-500");
                                div.closest("details").open = true;
                                hayError = true;
                            }
                        }

                        if (!corte.value.trim()) {
                            corte.classList.add("border-red-500");
                            div.closest("details").open = true;
                            hayError = true;
                        }

                        if (hayError) {
                            errores.push(`Paquete ${paqueteNum}, prenda ${prendaIndex + 1}`);
                            if (!primerError) primerError = div;
                        } else {
                            datosAEnviar.push({
                                id_envio: envioActual.id,
                                descripcion: desc.value.trim(),
                                talla: talla.value,
                                cantidad: parseInt(cantidad.value),
                                numero_corte: corte.value.trim(),
                                paquete: paqueteNum,
                                created_at: fechaCreacionGlobal,
                            });
                        }
                    }
                }

                if (errores.length > 0) {
                    if (primerError) {
                        primerError.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    document.getElementById("mensaje-errores").innerText = "⚠️ Corrige los campos marcados en rojo antes de continuar.";
                    document.getElementById("mensaje-errores").classList.remove("hidden");
                    document.getElementById("guardar-todo").classList.remove("hidden");
                    document.getElementById("cancelar").classList.remove("hidden");
                    document.getElementById("barra-progreso-container").classList.add("hidden");
                    return;
                }

                for (let i = 0; i < datosAEnviar.length; i++) {
                    await window.api.post('prendas_envio', datosAEnviar[i]);
                    const porcentaje = Math.round(((i + 1) / datosAEnviar.length) * 100);
                    document.getElementById("barra-progreso").style.width = `${porcentaje}%`;
                }

                await cargarEnvios();
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Todos los envíos fueron guardados correctamente.',
                    timer: 4000,
                    showConfirmButton: false
                }).then(() => Swal.close());
            });

            // Escuchar correcciones para ocultar errores y bordes rojos
            container.addEventListener('input', (e) => {
                const mensajeErrores = document.getElementById("mensaje-errores");
                if (!mensajeErrores.classList.contains("hidden")) {
                    mensajeErrores.classList.add("hidden");
                }
                if (e.target.classList.contains("border-red-500")) {
                    e.target.classList.remove("border-red-500");
                }
                const aviso = e.target.closest("div.mb-4")?.querySelector(".aviso-decimales");
                if (aviso) aviso.classList.add("hidden");
            });

            container.addEventListener('change', (e) => {
                const mensajeErrores = document.getElementById("mensaje-errores");
                if (!mensajeErrores.classList.contains("hidden")) {
                    mensajeErrores.classList.add("hidden");
                }
                if (e.target.classList.contains("border-red-500")) {
                    e.target.classList.remove("border-red-500");
                }
                const aviso = e.target.closest("div.mb-4")?.querySelector(".aviso-decimales");
                if (aviso) aviso.classList.add("hidden");
            });

            container.addEventListener("input", (e) => {
                if (e.target.classList.contains("descripcion-input")) {
                    const input = e.target;
                    const lista = input.closest("div").querySelector("ul.sugerencias-box");
                    const filtro = input.value.toLowerCase();
                    const sugerencias = descripcionesUnicas
                        .filter(d => d.toLowerCase().includes(filtro) && filtro)
                        .slice(0, 10);

                    lista.innerHTML = sugerencias.map(d => `<li>${d}</li>`).join("");
                    lista.classList.toggle("hidden", sugerencias.length === 0);

                    // Mostrar y seleccionar sugerencias
                    lista.querySelectorAll("li").forEach(li => {
                        li.addEventListener("click", () => {
                            input.value = li.textContent;
                            lista.classList.add("hidden");
                        });
                    });
                }
            });


            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('agregar-prenda-btn')) {
                    const num = e.target.dataset.paquete;
                    const contenedor = document.getElementById(`contenedor-prendas-${num}`);
                    const index = contenedor.querySelectorAll('div.mb-4').length;

                    // Insertar nueva prenda
                    contenedor.insertAdjacentHTML('beforeend', crearFormularioPrendaHTML(num, index));

                    // Hacer scroll y enfocar el campo de descripción automáticamente
                    const nuevoDiv = contenedor.querySelectorAll('div.mb-4')[index];
                    const inputDescripcion = nuevoDiv.querySelector(`[name="descripcion-${num}-${index}"]`);

                    if (inputDescripcion) {
                        inputDescripcion.focus();
                        nuevoDiv.scrollIntoView({ behavior: "smooth", block: "center" });

                        // Agregar clase de resaltado
                        nuevoDiv.classList.add("prenda-activa");

                        // Remover la clase después de un tiempo para que no quede permanente
                        setTimeout(() => {
                            nuevoDiv.classList.remove("prenda-activa");
                        }, 3000);
                    }
                }
            });
        }
    });
}

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("descripcion-input")) {
        document.querySelectorAll(".sugerencias-box").forEach(box => box.classList.add("hidden"));
    }
});



function formatearFechaBonita(fechaISO) {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const [anio, mes, dia] = fechaISO.split("-");
    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} del ${anio}`;
}

function formatearFechaCompleta(fechaISO) {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const [anio, mes, dia] = fechaISO.split("-");
    const date = new Date(`${fechaISO}T00:00:00`);
    const diaSemana = dias[date.getDay()];
    return `${diaSemana} ${parseInt(dia)} de ${meses[parseInt(mes) - 1]} del ${anio}`;
}

async function generarEtiquetaPDF(fecha, paquetes) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const envio = envioActual;

    const [year, month, day] = fecha.split("-");
    const fechaFormateada = `${day}/${month}/${year}`;
    const nombrePDF = `Etiquetas-${day}-${month}-${year}.pdf`;

    const totalPaquetes = Object.keys(paquetes).length;
    let etiquetasEnHoja = 0;
    let y = 10;

    Object.entries(paquetes).forEach(([numPaquete, prendas], index) => {
        let etiquetaYInicio = y;
        let alturaEstimado = 65;

        // Calcular altura dinámica antes de imprimir
        prendas.forEach((p) => {
            const desc = doc.splitTextToSize(p.descripcion.toUpperCase(), 95);
            alturaEstimado += desc.length * 7;
        });
        alturaEstimado += 20;

        // Salto de página si no cabe
        if (etiquetaYInicio + alturaEstimado > 280) {
            doc.addPage();
            y = 10;
            etiquetaYInicio = y;
            etiquetasEnHoja = 0;
        }

        // CONTENIDO DE LA ETIQUETA
        if (window.logoBase64) {
            doc.addImage(window.logoBase64, 'PNG', 10, y, 50, 25);
        }


        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text(`Fecha: ${fechaFormateada}`, 200, y + 12, { align: "right" });

        y += 35;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.text("DESTINO:", 10, y);
        doc.setFont("helvetica", "normal");
        doc.text(envio.empresa_destino?.toUpperCase(), 50, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("RECIBE:", 10, y);
        doc.setFont("helvetica", "normal");
        doc.text(envio.persona_recolectora?.toUpperCase(), 50, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("DIRECCIÓN:", 10, y);
        doc.setFont("helvetica", "normal");
        doc.text(envio.direccion_envio || "Sin dirección", 55, y, { maxWidth: 150 });
        y += 15;

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(10, y, 200, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text(`PAQUETE ${index + 1} / ${totalPaquetes}`, 10, y);
        y += 10;

        doc.setFontSize(17);
        doc.text("DESCRIPCIÓN", 10, y);
        doc.text("TALLA", 110, y);
        doc.text("CANT", 140, y);
        doc.text("LOTE", 170, y);
        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);

        prendas.forEach((p) => {
            const descLines = doc.splitTextToSize(p.descripcion.toUpperCase(), 95);
            const alto = descLines.length * 7;

            doc.text(descLines, 10, y);
            doc.text(p.talla, 110, y);
            doc.text(`${p.cantidad}`, 140, y);
            doc.text(p.numero_corte, 170, y);

            y += alto;
        });

        y += 5; // separación entre etiquetas
        etiquetasEnHoja++;

        // 🔲 Dibuja el borde ahora que se conoce la altura real
        const etiquetaYFin = y;
        const alturaReal = etiquetaYFin - etiquetaYInicio + 5;
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(8, etiquetaYInicio - 5, 194, alturaReal);
    });

    // 🔄 Obtener datos de traslado
    const traslado = await window.api.get(`datos_traslado/${envio.id}`);
    const datos = traslado.data;

    // 🔁 Añadir nueva página para el recibo
    doc.addPage();

    // --- LOGO ---
    if (window.logoBase64) {
        doc.addImage(window.logoBase64, 'PNG', 78, 10, 55, 28);
    }

    y = 45;

    // TÍTULOS
    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.text(datos.dueno || "CANDIDO CRUZ SANDOVAL", 105, y + 6, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("RECIBO DE ENTREGA DE MERCANCÍA PARA TRASLADO", 105, y + 16, { align: "center" });

    y += 30;
    const salto = 7;
    const colLabelX = 15;
    const colValorX = 85;

    // Total de paquetes (para el campo de descripción)
    const descripcion = `${totalPaquetes} PAQUETES QUE CONTIENEN FILIPINAS`;

    function fila(label, valor) {
        doc.setFont("times", "bold");
        doc.setFontSize(13);

        const maxWidth = 110; // espacio disponible a la derecha del label
        const labelWidth = doc.getTextWidth(label);

        // Posicionar el label fijo a la izquierda
        doc.text(label, colLabelX, y);

        // Separar el valor si es largo
        const textoFormateado = doc.splitTextToSize(valor || "-", maxWidth);

        doc.setFont("times", "normal");
        doc.text(textoFormateado, colValorX, y);

        // Ajustar salto en base a las líneas que ocupó el valor
        y += textoFormateado.length * salto + 2;
    }


    const fechaTexto = new Date(envio.created_at).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric"
    }).toUpperCase();

    fila("EMPRESA TRANSPORTISTA\nQUE RECIBE:", datos.empresa_transportista);
    fila("FECHA DE ENTREGA:", fechaTexto);
    fila("LUGAR DE ENTREGA:", datos.lugar_entrega);
    fila("DESCRIPCIÓN DE LA \nMERCANCÍA:", descripcion);
    fila("\nCLAVE DE PRODUCTO SAT:", datos.clave_producto_sat);
    fila("DESTINO:", envio.empresa_destino?.toUpperCase());
    fila("OCURRE Y RECIBE:", envio.persona_recolectora?.toUpperCase());
    fila("NOMBRE Y FIRMA DE QUIEN \nRECIBE:", "\n________________________________");


    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    // Mostrar alerta antes de abrir el PDF
    Swal.fire({
        icon: "success",
        title: "Etiquetas generadas con éxito",
        text: "El archivo PDF se abrirá en una nueva pestaña.",
        timer: 2000,
        showConfirmButton: false,
        willClose: () => {
            // Abrir PDF después del cierre del SweetAlert
            window.open(blobUrl, nombrePDF.replace(".pdf", ""));
        }
    });

}




async function editarModalPaquetes(fechaSeleccionada) {
    const fechaOriginal = fechaSeleccionada;
    let fechaCreacionGlobal = fechaOriginal;

    const response = await window.api.get("prendas_envio");

    const prendas = response.data.filter(p =>
        p.id_envio === envioActual.id &&
        p.created_at.split("T")[0] === fechaOriginal
    );

    if (!prendas.length) {
        return Swal.fire("Sin datos", "Este envío no tiene prendas registradas para esta fecha.", "info");
    }

    const paquetesAgrupados = {};
    prendas.forEach(p => {
        if (!paquetesAgrupados[p.paquete]) paquetesAgrupados[p.paquete] = [];
        paquetesAgrupados[p.paquete].push(p);
    });

    const paqueteKeys = Object.keys(paquetesAgrupados).sort((a, b) => a - b);

    function crearFormularioPrendaHTML(paqueteIndex, prendaIndex, prenda = {}) {
        const id = prenda.id || '';
        return `
        <div class="mb-4 border border-gray-300 p-3 rounded bg-white relative" data-id="${id}">
          <button type="button" class="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold eliminar-prenda" title="Eliminar prenda">✕</button>
          <label class="block mb-1 font-semibold">Descripción</label>
          <input type="text" name="descripcion-${paqueteIndex}-${prendaIndex}" value="${prenda.descripcion || ''}" class="w-full border px-3 py-2 rounded mb-3" placeholder="Descripción amplia...">
          <div class="flex gap-2 mb-2">
            <select name="talla-${paqueteIndex}-${prendaIndex}" class="border border-gray-400 px-2 py-1 rounded w-1/3">
              <option value="" disabled ${!prenda.talla ? 'selected' : ''}>Elija alguna talla</option>
              ${["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "Varias"]
                .map(t => `<option ${prenda.talla === t ? 'selected' : ''}>${t}</option>`).join("")}
            </select>
            <input type="number" name="cantidad-${paqueteIndex}-${prendaIndex}" value="${prenda.cantidad || ''}" class="border px-3 py-1 rounded w-1/3" placeholder="Cantidad">
            <input type="text" name="corte-${paqueteIndex}-${prendaIndex}" value="${prenda.numero_corte || ''}" class="border px-3 py-1 rounded w-1/3" placeholder="No. Corte">
          </div>
        </div>`;
    }

    function crearFormularioPaquete(paqueteIndex, prendas = []) {
        const htmlPrendas = prendas.map((p, i) => crearFormularioPrendaHTML(paqueteIndex, i, p)).join("");
        return `
        <details open class="mb-4 border rounded bg-gray-50">
          <summary class="bg-gray-200 px-4 py-2 font-bold cursor-pointer">Paquete ${paqueteIndex}</summary>
          <div class="p-4 space-y-3" id="contenedor-prendas-${paqueteIndex}">
            ${htmlPrendas}
          </div>
          <button type="button" data-paquete="${paqueteIndex}" class="agregar-prenda-btn bg-indigo-600 text-white px-3 py-1 rounded mt-2">Agregar prenda</button>
        </details>`;
    }

    Swal.fire({
        title: `Editando Envío del ${formatearFechaBonita(fechaSeleccionada)}`,
        html: `
        <div class="mb-4 bg-white p-3 rounded shadow border">
          <label class="font-semibold block mb-1">Fecha de creación</label>
          <div class="flex items-center gap-3">
            <span id="fecha-creacion-texto" class="text-gray-800 font-medium">${formatearFechaBonita(fechaCreacionGlobal)}</span>
            <button id="editar-fecha" class="text-blue-600 underline text-sm">Editar fecha</button>
          </div>
          <input type="date" id="input-fecha" value="${fechaCreacionGlobal}" class="mt-2 hidden border px-3 py-1 rounded" />
        </div>

        <div id="contenedor-paquetes">
          ${paqueteKeys.map(num => crearFormularioPaquete(num, paquetesAgrupados[num])).join("")}
        </div>

        <div class="mt-4 hidden" id="barra-progreso-container">
            <p class="text-sm text-gray-600 mb-1">Guardando cambios...</p>
            <div class="w-full bg-gray-300 rounded h-3 overflow-hidden">
                <div id="barra-progreso" class="bg-green-500 h-3 w-0 transition-all duration-200"></div>
            </div>
        </div>

        <div class="flex justify-end mt-4 items-center gap-2">
            <button id="cancelar" class="bg-red-500 text-white px-4 py-2 rounded">Cancelar</button>
            <button id="actualizar-todo" class="bg-green-600 text-white px-4 py-2 rounded">Guardar Cambios</button>
        </div>`,
        width: '70rem',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            const container = document.getElementById('contenedor-paquetes');

            document.getElementById('editar-fecha').addEventListener('click', () => {
                const inputFecha = document.getElementById('input-fecha');
                inputFecha.classList.toggle('hidden');
                inputFecha.focus();
            });

            document.getElementById('input-fecha').addEventListener('change', (e) => {
                fechaCreacionGlobal = e.target.value;
                document.getElementById('fecha-creacion-texto').innerText = formatearFechaBonita(fechaCreacionGlobal);
            });

            container.addEventListener('click', async (e) => {
                if (e.target.classList.contains('agregar-prenda-btn')) {
                    const num = e.target.dataset.paquete;
                    const contenedor = document.getElementById(`contenedor-prendas-${num}`);
                    const index = contenedor.querySelectorAll('div.mb-4').length;
                    contenedor.insertAdjacentHTML('beforeend', crearFormularioPrendaHTML(num, index));
                }

                if (e.target.classList.contains('eliminar-prenda')) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Elimina otros cuadros activos si existieran
                    document.querySelectorAll('.confirmacion-flotante').forEach(f => f.remove());

                    const div = e.target.closest('.mb-4');
                    const id = div.getAttribute('data-id');
                    const paqueteContenedor = div.closest("div[id^='contenedor-prendas-']");

                    const confirmBox = document.createElement('div');
                    confirmBox.className = 'confirmacion-flotante';
                    confirmBox.innerHTML = `
                        <p class="text-xl text-red-600 mb-3 font-bold">¿Eliminar esta prenda?</p>
                        <div class="flex justify-end">
                            <button class="bg-red-600 text-white rounded px-2 py-1 text-xs mr-1 confirmar-si">Sí</button>
                            <button class="bg-gray-300 text-black rounded px-2 py-1 text-xs confirmar-no">No</button>
                        </div>
                    `;

                    div.appendChild(confirmBox);

                    confirmBox.querySelector('.confirmar-si').addEventListener('click', async () => {
                        try {
                            if (id) await window.api.delete(`prendas_envio/${id}`);
                            div.remove();

                            const restantes = paqueteContenedor.querySelectorAll('.mb-4');
                            if (restantes.length === 0) {
                                const paqueteWrapper = paqueteContenedor.closest('details');
                                paqueteWrapper.classList.add('paquete-desapareciendo');
                                setTimeout(() => paqueteWrapper.remove(), 250); // igual a duración de fadeOut

                            }

                            // Si ya no queda ningún paquete visible, elimina el envío completo
                            const paquetesRestantes = document.querySelectorAll('div[id^="contenedor-prendas-"]');
                            if (paquetesRestantes.length === 0) {
                                await window.api.delete(`envios/${envioActual.id}`);
                                Swal.close();
                                await cargarDatosEnvio();
                                await cargarEnvios();
                                Swal.fire("Eliminado", "Se eliminó el envío completo porque ya no contenía ninguna prenda.", "info");
                                return;
                            }

                        } catch (error) {
                            console.error("Error al eliminar:", error);
                            alert("Ocurrió un error al intentar eliminar la prenda.");
                        } finally {
                            confirmBox.remove();
                        }
                    });

                    confirmBox.querySelector('.confirmar-no').addEventListener('click', () => {
                        confirmBox.remove();
                    });
                }
            });

            document.getElementById("cancelar").addEventListener("click", () => Swal.close());

            document.getElementById("actualizar-todo").addEventListener("click", async () => {
                const errores = [];
                const totalCampos = document.querySelectorAll("div.mb-4").length;
                let guardados = 0;

                document.getElementById("actualizar-todo").classList.add("hidden");
                document.getElementById("cancelar").classList.add("hidden");
                document.getElementById("barra-progreso-container").classList.remove("hidden");

                for (let pIndex = 0; pIndex < paqueteKeys.length; pIndex++) {
                    const paqueteNum = paqueteKeys[pIndex];
                    const contenedor = document.getElementById(`contenedor-prendas-${paqueteNum}`);
                    if (!contenedor) continue;
                    const items = contenedor.querySelectorAll('div.mb-4');

                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        const id = item.getAttribute("data-id");

                        const desc = item.querySelector(`[name^="descripcion-"]`);
                        const talla = item.querySelector(`[name^="talla-"]`);
                        const cantidad = item.querySelector(`[name^="cantidad-"]`);
                        const corte = item.querySelector(`[name^="corte-"]`);

                        if (!desc || !talla || !cantidad || !corte) {
                            console.warn("Se omitió una prenda incompleta o eliminada");
                            continue; // salta a la siguiente iteración sin fallar
                        }

                        [desc, talla, cantidad, corte].forEach(input => input.classList.remove("border-red-500"));

                        if (!desc.value || !talla.value || !cantidad.value || !corte.value) {
                            errores.push(`Paquete ${paqueteNum}, prenda ${i + 1}`);
                            [desc, talla, cantidad, corte].forEach(input => {
                                if (!input.value) input.classList.add("border-red-500");
                            });
                            continue;
                        }

                        const payload = {
                            id_envio: envioActual.id,
                            descripcion: desc.value.trim(),
                            talla: talla.value,
                            cantidad: cantidad.value,
                            numero_corte: corte.value.trim(),
                            paquete: parseInt(paqueteNum),
                            created_at: fechaCreacionGlobal,
                        };

                        if (id) {
                            await window.api.put(`prendas_envio/${id}`, payload);
                        } else {
                            await window.api.post("prendas_envio", payload);
                        }

                        guardados++;
                        const progreso = Math.round((guardados / totalCampos) * 100);
                        document.getElementById("barra-progreso").style.width = `${progreso}%`;
                    }
                }

                if (errores.length > 0) {
                    Swal.fire("Campos incompletos", `Faltan datos en:\n${errores.join("\n")}`, "warning");
                    document.getElementById("actualizar-todo").classList.remove("hidden");
                    document.getElementById("cancelar").classList.remove("hidden");
                    document.getElementById("barra-progreso-container").classList.add("hidden");
                } else {
                    await cargarEnvios();
                    Swal.fire("¡Actualizado!", "Los datos fueron modificados correctamente.", "success");
                }
            });
        }
    });
}


function abrirModalTraslado() {
    if (!envioActual) return Swal.fire("Sin envío", "Debes registrar un envío primero", "info");

    window.api.get(`datos_traslado/${envioActual.id}`).then(res => {
        mostrarFormularioTraslado(res.data);
    }).catch(() => {
        mostrarFormularioTraslado(); // sin datos (nuevo)
    });
}

function mostrarFormularioTraslado(data = {}) {
    Swal.fire({
        title: "Datos de Traslado",
        html: `
        <input type="text" id="dueno" class="swal2-input" placeholder="Dueño" value="${data.dueno || 'CANDIDO CRUZ SANDOVAL'}">
        <input type="text" id="transportista" class="swal2-input" placeholder="Empresa Transportista" value="${data.empresa_transportista || ''}">
        <input type="text" id="lugar" class="swal2-input" placeholder="Lugar de entrega" value="${data.lugar_entrega || ''}">
        <input type="text" id="clave" class="swal2-input" placeholder="Clave SAT" value="${data.clave_producto_sat || ''}">
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        preConfirm: async () => {
            const dueno = document.getElementById("dueno").value.trim();
            const empresa = document.getElementById("transportista").value.trim();
            const lugar = document.getElementById("lugar").value.trim();
            const clave = document.getElementById("clave").value.trim();

            if (!dueno || !empresa || !lugar || !clave) {
                Swal.showValidationMessage("Completa todos los campos correctamente.");
                return false;
            }

            await window.api.post("datos_traslado", {
                envio_id: envioActual.id,
                dueno,
                empresa_transportista: empresa,
                lugar_entrega: lugar,
                clave_producto_sat: clave,
            });

            await cargarDatosTraslado(); // ✅ actualiza vista previa

            Swal.fire({
                icon: 'success',
                title: '¡Datos guardados!',
                text: 'Los datos de traslado se actualizaron correctamente.',
                timer: 2500,
                showConfirmButton: false
            });
        }
    });
}


async function cargarDatosTraslado() {
    try {
        const response = await window.api.get(`datos_traslado/${envioActual.id}`);
        const data = response.data;

        document.getElementById("traslado-dueno").innerText = data.dueno;
        document.getElementById("traslado-transportista").innerText = data.empresa_transportista;
        document.getElementById("traslado-lugar").innerText = data.lugar_entrega;
        document.getElementById("traslado-clave").innerText = data.clave_producto_sat;

        document.getElementById("datosTraslado").classList.remove("hidden");
    } catch {
        // Si no hay traslado, oculta solo esa parte
        document.getElementById("datosTraslado").classList.add("hidden");
    }
}


async function generarResumenPDF(fecha) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const envio = envioActual;

    // Obtener todas las prendas de esa fecha
    const response = await window.api.get("prendas_envio");
    const prendas = response.data.filter(p =>
        p.id_envio === envio.id &&
        p.created_at.split("T")[0] === fecha
    );

    // Agrupar por clave compuesta (desc + talla + corte)
    const resumen = {};

    prendas.forEach(p => {
        const key = `${p.descripcion}|${p.talla}|${p.numero_corte}`;
        if (!resumen[key]) {
            resumen[key] = {
                descripcion: p.descripcion,
                talla: p.talla,
                numero_corte: p.numero_corte,
                cantidad: 0
            };
        }
        resumen[key].cantidad += parseInt(p.cantidad);
    });

    // Inicia el PDF
    const [year, month, day] = fecha.split("-");
    const fechaFormateada = `${day}/${month}/${year}`;
    const nombrePDF = `Resumen-${day}-${month}-${year}.pdf`;

    let y = 20;

    if (window.logoBase64) {
        doc.addImage(window.logoBase64, 'PNG', 80, 10, 50, 25);
        y = 45;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("RESUMEN DE ENVÍO", 105, y, { align: "center" });

    y += 10;
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(`Fecha: ${fechaFormateada}`, 15, y);
    y += 8;
    doc.text(`Empresa destino: ${envio.empresa_destino}`, 15, y);
    y += 8;
    doc.text(`Persona que recibe: ${envio.persona_recolectora}`, 15, y);
    y += 8;
    doc.text(`Dirección: ${envio.direccion_envio}`, 15, y);

    y += 12;
    doc.setFont("times", "bold");
    doc.text("DESCRIPCIÓN", 15, y);
    doc.text("TALLA", 100, y);
    doc.text("CANT.", 130, y);
    doc.text("LOTE", 155, y);

    y += 6;
    doc.setFont("times", "normal");

    Object.values(resumen).forEach(p => {
        const desc = doc.splitTextToSize(p.descripcion.toUpperCase(), 80);
        const alto = desc.length * 6;

        if (y + alto > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(desc, 15, y);
        doc.text(p.talla, 100, y);
        doc.text(String(p.cantidad), 130, y);
        doc.text(p.numero_corte, 155, y);

        y += alto + 2;
    });

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    // Mostrar alerta antes de abrir el PDF
    Swal.fire({
        icon: "success",
        title: "Resumen generado con éxito",
        text: "El archivo PDF se abrirá en una nueva pestaña.",
        timer: 2000,
        showConfirmButton: false,
        willClose: () => {
            // Abrir PDF después del cierre del SweetAlert
            window.open(blobUrl, nombrePDF.replace(".pdf", ""));
        }
    });

}
