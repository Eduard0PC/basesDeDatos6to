//FUncionalidad del sidebar
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("toggleSidebar");
    const content = document.querySelector(".content");
    const header = document.querySelector(".header");

    toggleButton.addEventListener("click", function () {
        sidebar.classList.toggle("hidden");
        content.classList.toggle("sidebar-hidden");
        header.classList.toggle("sidebar-hidden");
    });
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

//Muestra el nombre deñ usuario en la página home
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/usuario');
        const data = await response.json();

        if (data.success) {
            document.getElementById("welcome").textContent = `Bienvenido ${data.nombre}`;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error("Error obteniendo el usuario:", error);
        window.location.href = '/';
    }
});

