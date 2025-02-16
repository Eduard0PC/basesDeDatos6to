//FUncionalidad del sidebar
document.querySelector(".toggle-btn").addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("collapsed");
});



function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

    // Obtiene hora y fecha formateadas
    const currentTime = now.toLocaleTimeString('en-US', timeOptions);
    const currentDate = now.toLocaleDateString('en-US', dateOptions);

    // Actualiza el contenido de los elementos
    document.getElementById('current-time').textContent = currentTime;
    document.getElementById('current-date').textContent = currentDate;
}

// Actualiza la fecha y hora al cargar la página
updateDateTime();

// Actualiza cada segundo
setInterval(updateDateTime, 1000);

//Muestra el nombre del usuario en la página home
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/usuario');
        const data = await response.json();

        if (data.success) {
            const welcomeText = document.getElementById("welcome");
            const username = data.nombre; // Nombre del usuario

            // Muestra el nombre del usuario
            welcomeText.textContent = `Bienvenido ${username}`;

            // Ajusta la posición del texto según el tamaño del nombre
            const offset = username.length * 2; 
            welcomeText.style.marginLeft = -offset + 'px';
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
