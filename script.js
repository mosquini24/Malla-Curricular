// Este evento se asegura de que todo el código se ejecute solo cuando la página se haya cargado por completo.
document.addEventListener('DOMContentLoaded', function() {

    // -- SELECCIÓN DE ELEMENTOS DEL HTML --
    // Aquí "guardamos" en variables los elementos de la página con los que vamos a interactuar.
    const ramos = document.querySelectorAll('.ramo');
    const modal = document.getElementById('modal-requisitos');
    const cerrarModalBtn = document.querySelector('.cerrar-modal');
    const listaRequisitosUl = document.getElementById('lista-requisitos');
    const banner = document.getElementById('felicitaciones-banner');
    
    // -- ALMACENAMIENTO LOCAL --
    // Cargamos la lista de ramos aprobados desde la memoria del navegador (localStorage).
    // Si no hay nada guardado, empezamos con una lista vacía [].
    let ramosAprobados = JSON.parse(localStorage.getItem('ramosAprobados')) || [];

    // Variable para controlar el temporizador del banner
    let bannerTimeout;

    // -- FUNCIÓN PARA MOSTRAR Y OCULTAR EL BANNER --
    function mostrarBannerFelicitaciones() {
        // Si ya hay un banner mostrándose, reiniciamos su temporizador.
        clearTimeout(bannerTimeout);

        // Hacemos visible el banner añadiendo la clase 'visible'.
        banner.classList.add('visible');

        // Configuramos un temporizador para que el banner se oculte solo después de 4 segundos.
        bannerTimeout = setTimeout(() => {
            banner.classList.remove('visible');
        }, 4000); // 4000 milisegundos = 4 segundos
    }

    // -- FUNCIÓN PRINCIPAL PARA ACTUALIZAR LA VISTA DE LA MALLA --
    // Esta función recorre todos los ramos y les aplica los estilos correctos (aprobado, bloqueado, o normal).
    function actualizarMalla() {
        ramos.forEach(ramo => {
            const id = ramo.dataset.id;
            const requisitos = JSON.parse(ramo.dataset.requisitos);

            // 1. Limpiamos todos los estilos previos del ramo.
            ramo.classList.remove('aprobado', 'bloqueado');

            // 2. Si el ramo está en nuestra lista de aprobados, le añadimos la clase 'aprobado'.
            if (ramosAprobados.includes(id)) {
                ramo.classList.add('aprobado');
            } else {
                // 3. Si no está aprobado, verificamos si cumple los requisitos.
                let requisitosCumplidos = true;
                // Caso especial para internados que requieren todos los ramos hasta S8.
                if (requisitos[0] === "S1_S8") {
                    const totalRamosS1a8 = 45; // Número total de ramos de S1 a S8. Ajustar si cambia.
                    if (ramosAprobados.length < totalRamosS1a8) { // Simplificamos la comprobación
                         requisitosCumplidos = false;
                    }
                } else {
                    // Verificación normal de requisitos para los demás ramos.
                    for (const reqId of requisitos) {
                        if (!ramosAprobados.includes(reqId)) {
                            requisitosCumplidos = false;
                            break; // Si falta un requisito, no es necesario seguir buscando.
                        }
                    }
                }
                
                // 4. Si los requisitos NO se cumplen, le añadimos la clase 'bloqueado'.
                if (!requisitosCumplidos) {
                    ramo.classList.add('bloqueado');
                }
            }
        });
    }
    
    // -- FUNCIÓN PARA MANEJAR EL CLIC EN UN RAMO --
    function manejarClickRamo(e) {
        const ramo = e.currentTarget;
        const id = ramo.dataset.id;

        // Si el ramo está bloqueado, mostramos el pop-up y no hacemos nada más.
        if (ramo.classList.contains('bloqueado')) {
            const requisitos = JSON.parse(ramo.dataset.requisitos);
            const nombresRequisitosFaltantes = [];
            
            // Llenamos la lista de nombres de los requisitos que faltan.
            requisitos.forEach(reqId => {
                if (!ramosAprobados.includes(reqId)) {
                    const reqRamo = document.querySelector(`.ramo[data-id='${reqId}']`);
                    // Si el requisito es el especial S1_S8, mostramos un mensaje claro.
                    if(reqRamo === null && reqId === "S1_S8"){
                       nombresRequisitosFaltantes.push('TODOS los ramos hasta VIII Semestre');
                    } else if (reqRamo) {
                       nombresRequisitosFaltantes.push(reqRamo.dataset.nombre);
                    }
                }
            });
            
            mostrarModalRequisitos(nombresRequisitosFaltantes);
            return; // Termina la función aquí.
        }

        // Si el ramo NO está bloqueado, cambiamos su estado.
        const yaEstabaAprobado = ramosAprobados.includes(id);
        
        if (yaEstabaAprobado) {
            // Si ya estaba aprobado, lo quitamos de la lista (lo des-aprobamos).
            ramosAprobados = ramosAprobados.filter(aprobadoId => aprobadoId !== id);
        } else {
            // Si no estaba aprobado, lo agregamos a la lista.
            ramosAprobados.push(id);
            // ¡Y mostramos el banner de felicitaciones!
            mostrarBannerFelicitaciones();
        }

        // Guardamos la lista actualizada en la memoria del navegador.
        localStorage.setItem('ramosAprobados', JSON.stringify(ramosAprobados));

        // Finalmente, actualizamos la vista de toda la malla para que refleje el cambio.
        actualizarMalla();
    }

    // -- FUNCIÓN PARA MOSTRAR EL POP-UP (MODAL) DE REQUISITOS --
    function mostrarModalRequisitos(nombresRequisitos) {
        listaRequisitosUl.innerHTML = ''; // Limpiamos la lista por si tenía algo de antes.
        
        // Creamos un elemento <li> por cada requisito faltante y lo añadimos a la lista.
        nombresRequisitos.forEach(nombre => {
            const li = document.createElement('li');
            li.textContent = nombre;
            listaRequisitosUl.appendChild(li);
        });

        modal.style.display = 'block'; // Mostramos el pop-up.
    }

    // -- ASIGNACIÓN DE EVENTOS --
    // Le decimos a cada ramo que ejecute la función 'manejarClickRamo' cuando se le haga clic.
    ramos.forEach(ramo => {
        ramo.addEventListener('click', manejarClickRamo);
    });

    // Eventos para cerrar el pop-up.
    cerrarModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) { // Si se hace clic fuera del contenido del pop-up...
            modal.style.display = 'none'; // ...también se cierra.
        }
    });

    // -- INICIO --
    // Llamamos a esta función una vez al principio para que la malla se cargue con el estado correcto.
    actualizarMalla();
});
