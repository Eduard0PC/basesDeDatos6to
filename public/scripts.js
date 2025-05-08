import { garantLoad, backtoHome, loadEmployees, loadSales, loadFood, loadOrders } from './loader.js';
//Purikitaka ti purikitaka ta

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

            // Adjust the sidebar and cards based on the user's role
            if (role.toLowerCase() === "user") {
                // Remove "Empleados" button from the sidebar
                const empleadosBtn = document.getElementById("empleadosBtn");
                if (empleadosBtn) {
                    empleadosBtn.remove();
                }

                // Remove the "Empleados" card
                const empleadoCard = document.querySelector('.card-empleados');
                const allcards = document.querySelector(".allcards");

                if (empleadoCard) {
                    empleadoCard.remove();
                    setTimeout(() => {
                        allcards.classList.add("no-empleados"); // Adjust grid layout
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
//MANEJO DEL BOTON HOME
document.getElementById('homeBtn').addEventListener('click', ()=>(garantLoad(backtoHome)));

//MANEJO DEL BOTON EMPLEADOS
document.getElementById('empleadosBtn').addEventListener('click', ()=>(garantLoad(loadEmployees)));

//MANEJO DEL BOTON VENTAS
document.getElementById('ventasBtn').addEventListener('click', ()=>(garantLoad(loadSales)));

//MANEJO DEL BOTON INSUMOS
document.getElementById('insumosBtn').addEventListener('click', ()=>(garantLoad(loadFood)));

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

//CARGA DE LA CARD PEDIDOS
loadOrders();

//MANEJO DE LA CARD EMPLEADOS
document.getElementById('empCard').addEventListener('click', ()=>(garantLoad(loadEmployees)));

//MANEJO DE LA CARD VENTAS
document.getElementById('venCard').addEventListener('click', ()=>(garantLoad(loadSales)));

//MANEJO DE LA CARD INSUMOS
document.getElementById('insCard').addEventListener('click', ()=>(garantLoad(loadFood)));
