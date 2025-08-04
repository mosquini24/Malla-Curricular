document.addEventListener('DOMContentLoaded', function() {

    const ramos = document.querySelectorAll('.ramo');
    const modal = document.getElementById('modal-requisitos');
    const cerrarModal = document.querySelector('.cerrar-modal');
    const listaRequisitosUl = document.getElementById('lista-requisitos');

    // Cargar el estado de los ramos aprobados desde localStorage
    let ramosAprobados = JSON.parse(localStorage.getItem('ramosAprobados')) || [];

    // IDs de todos los ramos de los semestres I al VIII
    const ramosS1a8 = [];
    for (let i = 1; i <= 8; i++) {
        const semestreContainer = document.querySelector(`#malla-curricular > .semestre:nth-child(${i})`);
        semestreContainer.querySelectorAll('.ramo').forEach(ramo => {
            ramosS1a8.push(ramo.dataset.id);
        });
    }

    // Función para actualizar el estado visual de toda la malla
    function actualizarMalla() {
        ramos.forEach(ramo => {
            const id = ramo.dataset.id;
            const requisitos = JSON.parse(ramo.dataset.requisitos);

            // Limpiar clases de estado
            ramo.classList.remove('aprobado', 'bloqueado');

            // Marcar como aprobado si está en la lista
            if (ramosAprobados.includes(id)) {
                ramo.classList.add('aprobado');
                return; // Si está aprobado, no puede estar bloqueado
            }

            // Verificar requisitos
            let requisitosCumplidos = true;
            if (requisitos.length > 0) {
                // Caso especial para internados
                if (requisitos[0] === "S1_S8") {
                    const aprobadosS1a8 = ramosS1a8.filter(idRamo => ramosAprobados.includes(idRamo));
                    if (aprobadosS1a8.length !== ramosS1a8.length) {
                        requisitosCumplidos = false;
                    }
                } else {
                    // Caso normal para otros ramos
                    for (const req of requisitos) {
                        if (!ramosAprobados.includes(req)) {
                            requisitosCumplidos = false;
                            break;
                        }
                    }
                }
            }
            
            if (!requisitosCumplidos) {
                ramo.classList.add('bloqueado');
            }
        });
    }
    
    // Función para manejar el clic en un ramo
    function manejarClickRamo(e) {
        const ramo = e.currentTarget;
        const id = ramo.dataset.id;
        const nombre = ramo.dataset.nombre;
        const requisitos = JSON.parse(ramo.dataset.requisitos);

        // Si el ramo está bloqueado, mostrar modal con requisitos
        if (ramo.classList.contains('bloqueado')) {
            const requisitosFaltantes = [];

            // Lógica para el caso especial de internados
            if (requisitos[0] === "S1_S8") {
                requisitosFaltantes.push({ nombre: 'TODOS los ramos hasta el VIII Semestre' });
            } else {
                // Lógica para ramos normales
                requisitos.forEach(reqId => {
                    if (!ramosAprobados.includes(reqId)) {
                        const reqRamo = document.querySelector(`.ramo[data-id='${reqId}']`);
                        requisitosFaltantes.push({ nombre: reqRamo.dataset.nombre });
                    }
                });
            }
            
            mostrarModalRequisitos(requisitosFaltantes);
            return;
        }

        // Si no está bloqueado, cambiar su estado (aprobar/desaprobar)
        if (ramosAprobados.includes(id)) {
            // Desaprobar: remover de la lista
            ramosAprobados = ramosAprobados.filter(aprobadoId => aprobadoId !== id);
        } else {
            // Aprobar: agregar a la lista
            ramosAprobados.push(id);
        }

        // Guardar el nuevo estado en localStorage
        localStorage.setItem('ramosAprobados', JSON.stringify(ramosAprobados));

        // Actualizar la visualización de toda la malla
        actualizarMalla();
    }

    // Función para mostrar el modal
    function mostrarModalRequisitos(requisitosFaltantes) {
        // Limpiar lista anterior
        listaRequisitosUl.innerHTML = '';
        
        // Llenar la lista con los nuevos requisitos faltantes
        requisitosFaltantes.forEach(req => {
            const li = document.createElement('li');
            li.textContent = req.nombre;
            listaRequisitosUl.appendChild(li);
        });

        modal.style.display = 'block';
    }

    // Asignar el evento click a cada ramo
    ramos.forEach(ramo => {
        ramo.addEventListener('click', manejarClickRamo);
    });

    // Evento para cerrar el modal
    cerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Evento para cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Llamada inicial para establecer el estado correcto al cargar la página
    actualizarMalla();
});
