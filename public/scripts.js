//Purikitaka

//FUncionalidad del sidebar
document.querySelector(".toggle-btn").addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("collapsed");
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

            welcomeText.textContent = `Bienvenido ${username} (${role})`;

            if (role.toLowerCase() === "user") {
                // Eliminar "Empleados" del sidebar
                document.querySelector('li:has(.icon[src="src/empb.png"])')?.remove();

                // Eliminar la tarjeta de empleados
                const empleadoCard = document.querySelector('.card-empleados');
                const allcards = document.querySelector(".allcards");

                if (empleadoCard) {
                    empleadoCard.remove();

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
