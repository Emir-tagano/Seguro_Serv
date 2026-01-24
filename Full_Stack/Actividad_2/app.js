// Clase que representa una Tarea individual
class Tarea {
    constructor(nombre) {
        this.id = Date.now().toString(); // ID único basado en timestamp
        this.nombre = nombre;
        this.completada = false;
    }

    // Método para cambiar el estado de completada
    toggleEstado() {
        this.completada = !this.completada;
    }

    // Método para editar el nombre de la tarea
    editarNombre(nuevoNombre) {
        this.nombre = nuevoNombre;
    }
}

// Clase que gestiona todas las tareas (Gestor)
class GestorDeTareas {
    constructor() {
        // Intentar cargar tareas desde LocalStorage
        const tareasGuardadas = JSON.parse(localStorage.getItem('tareas'));
        this.tareas = tareasGuardadas ? tareasGuardadas.map(t => {
            // Reconstruir objetos Tarea (porque JSON pierde los métodos)
            const tarea = new Tarea(t.nombre);
            tarea.id = t.id;
            tarea.completada = t.completada;
            return tarea;
        }) : [];
    }

    agregarTarea(nombre) {
        const nuevaTarea = new Tarea(nombre);
        this.tareas.push(nuevaTarea);
        this.guardarTareas();
        return nuevaTarea;
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        this.guardarTareas();
    }

    obtenerTarea(id) {
        return this.tareas.find(t => t.id === id);
    }

    guardarTareas() {
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }
}

// Inicialización
const gestor = new GestorDeTareas();

// Referencias al DOM
const inputTarea = document.getElementById('nuevaTarea');
const btnAgregar = document.getElementById('agregarBtn');
const listaTareas = document.getElementById('listaTareas');

// Función para renderizar una tarea en el DOM
const renderizarTarea = (tarea) => {
    // Verificar si ya existe en el DOM para no duplicar (útil si hiciéramos un re-render parcial, 
    // pero aquí limpiaremos o añadiremos una a una. Para simplificar, añadimos al final).

    const li = document.createElement('li');
    li.setAttribute('data-id', tarea.id);
    if (tarea.completada) li.classList.add('completed');

    li.innerHTML = `
        <span class="texto-tarea">${tarea.nombre}</span>
        <div class="task-buttons">
            <button class="btn btn-complete" title="Completar"><i class="fas fa-check"></i></button>
            <button class="btn btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Eventos de los botones de la tarea
    const btnComplete = li.querySelector('.btn-complete');
    const btnEdit = li.querySelector('.btn-edit');
    const btnDelete = li.querySelector('.btn-delete');
    const spanTexto = li.querySelector('.texto-tarea');

    // Completar Tarea
    btnComplete.addEventListener('click', () => {
        tarea.toggleEstado();
        gestor.guardarTareas();
        li.classList.toggle('completed');
    });

    // Eliminar Tarea
    btnDelete.addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            gestor.eliminarTarea(tarea.id);
            li.remove();
        }
    });

    // Editar Tarea
    btnEdit.addEventListener('click', () => {
        // Cambiar a modo edición
        const inputEdit = document.createElement('input');
        inputEdit.type = 'text';
        inputEdit.value = tarea.nombre;
        inputEdit.classList.add('edit-mode');

        // Reemplazar span con input
        li.insertBefore(inputEdit, spanTexto);
        li.removeChild(spanTexto);
        inputEdit.focus();

        // Ocultar botones temporalmente o cambiar icono
        btnEdit.style.display = 'none';

        // Guardar cambios al perder foco o presionar Enter
        const guardarEdicion = () => {
            const nuevoNombre = inputEdit.value.trim();
            if (nuevoNombre) {
                tarea.editarNombre(nuevoNombre);
                gestor.guardarTareas();

                // Restaurar vista
                spanTexto.textContent = nuevoNombre;
                li.insertBefore(spanTexto, inputEdit);
                li.removeChild(inputEdit);
                btnEdit.style.display = 'inline-block';
            } else {
                alert("El nombre de la tarea no puede estar vacío.");
                inputEdit.focus();
            }
        };

        inputEdit.addEventListener('blur', guardarEdicion);
        inputEdit.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') guardarEdicion();
        });
    });

    listaTareas.appendChild(li);
};

// Cargar tareas iniciales
gestor.tareas.forEach(tarea => renderizarTarea(tarea));

// Evento: Agregar Nueva Tarea
const manejarAgregarTarea = () => {
    const nombre = inputTarea.value.trim();
    if (nombre) {
        const nuevaTarea = gestor.agregarTarea(nombre);
        renderizarTarea(nuevaTarea);
        inputTarea.value = '';
        inputTarea.focus();
    } else {
        alert('Por favor, escribe el nombre de la tarea.');
    }
};

btnAgregar.addEventListener('click', manejarAgregarTarea);

inputTarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') manejarAgregarTarea();
});