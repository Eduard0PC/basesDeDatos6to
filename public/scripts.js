//Purikitaka

//Funcionalidad del sidebar
document.querySelector(".toggle-btn").addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("collapsed");
});

// Asegura de que el sidebar esté oculto por defecto al cargar
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".sidebar").classList.add("collapsed");
});

function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

    // Obtiene hora y fecha 
    const currentTime = now.toLocaleTimeString('en-US', timeOptions);
    const currentDate = now.toLocaleDateString('en-US', dateOptions);

    // Actualiza el contenido contenoso
    document.getElementById('current-time').textContent = currentTime;
    document.getElementById('current-date').textContent = currentDate;
}

// Actualiza la fecha y hora al cargar la página
updateDateTime();

// Actualiza cada segundo
setInterval(updateDateTime, 1000);

//FUNCIONALIDADES DEPENDIENDO DEL ROL DEL USUARIO (ADMIN, USER)
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/usuario');
        const data = await response.json();

        if (data.success) {
            const welcomeText = document.getElementById("welcome");
            const username = data.nombre;
            const role = data.rol;

            welcomeText.textContent = `Bienvenid@ ${username} (${role})`;

            // Ajuste dinámico del min-width
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.whiteSpace = "nowrap"; // Evita el salto de línea
            tempSpan.style.font = window.getComputedStyle(welcomeText).font; // Asegura la misma fuente
            tempSpan.textContent = welcomeText.textContent;
            document.body.appendChild(tempSpan);

            // Ajusta el min-width correctamente
            const textWidth = tempSpan.getBoundingClientRect().width;
            welcomeText.style.minWidth = `${Math.ceil(textWidth) + 20}px`; // 20px extra de margen pa que no explote

            // Elimina el span temporal
            document.body.removeChild(tempSpan);

            if (role.toLowerCase() === "user") {
                // Eliminar "Empleados" del sidebar
                document.querySelector('li:has(.icon[src="src/empb.png"])')?.remove();

                // Eliminar la tarjeta de empleados
                const empleadoCard = document.querySelector('.card-empleados');
                const allcards = document.querySelector(".allcards");

                if (empleadoCard) {
                    empleadoCard.remove(); //Borra, elimina, desintala, fulmina, destruye, aniquila, extermina, erradica, extingue, suprime, liquida, acaba, remueve, desinstala, desmonta, desarma, descompone la tarjeta de empleados
                    setTimeout(() => {
                        allcards.classList.add("no-empleados"); // Aplica la estructura de grid
                    }, 50);
                }
            }
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error("Error obteniendo el usuario:", error);
        window.location.href = '/';
    }
});


//MANEJO DEL BOTON DE CERRAR SESION
document.getElementById('logoutBtn').addEventListener('click', async () => {
    const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (data.success) {
        window.location.href = '/';
    } else {
        alert('Error al cerrar sesión');
    }
});
