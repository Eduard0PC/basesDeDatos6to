//Regresar a Home
export async function backtoHome(){
    hideComponent(".table-gen");
    showComponent(".card-insumos");
    showComponent(".card-ventas");
    showComponent(".card-empleados");
    showComponent(".card-pedidos");
    showComponent(".card-punto-venta");
}
//Carga pedidos
export async function loadOrders(){
    const destiny_load = document.querySelector('.card-pedidos');
    fetch("table.html")
    .then(response =>{
        if(response.ok){
            return response.text();
        }
    })
    .then(data=>{
        //Carga la plantilla
        destiny_load.innerHTML=data;
        //Contacto con la base de datos
        return connect('/see-pedidos');
    })
    .then(info=>{
        //Carga la información de la tabla
        generateTable(info.title, info.header, info.dbresults);
    })
    .catch(error=>console.error("Error al cargar el contenido: ", error));
}
//Elimina todas las cartas y carga la tabla
export async function loadEmployees(){
    //FASE 1: Borra
    hideComponent(".card-insumos");
    hideComponent(".card-ventas");
    hideComponent(".card-empleados");
    hideComponent(".card-pedidos");
    hideComponent(".card-punto-venta");
    //FASE 2: Carga
    const destiny_load = document.querySelector('.table-gen');
    fetch("table.html")
        .then(response => {
            if(response.ok){
                return response.text();
            }
        })
        .then(data=>{
            //Carga la plantilla
            destiny_load.innerHTML=data;
            //Contacto con la base de datos
            return connect('/see-empleados');
        })
        .then(info=>{
            //Carga la información de la tabla
            generateTable(info.title, info.header, info.dbresults);
            //Mostrar
            destiny_load.style.display="flex";
        })
        .catch(error=>console.error("Error al cargar contenido: ", error));
}
//AKA Component birthmaker - Buffed
function showComponent(componentname){
    const component = document.querySelector(componentname);
    component.style.display="flex";
}

//AKA Component Terminator - Nerfed
function hideComponent(componentname){
    const component = document.querySelector(componentname);
    component.style.display = "none";
}
function generateTable(title, header, data){
    //Buscar en table.html
    const destiny_load1 = document.querySelector('.table-title');
    const destiny_load2 = document.querySelector('.sys-table');
    //Añadir título en table.html
    destiny_load1.innerHTML = title;
    const tableh = document.createElement("thead");
    const tableb = document.createElement("tbody");
    //Poner el encabezado en table.html
    const hd = document.createElement("tr"); 
    header.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        hd.appendChild(th);
    });
    tableh.appendChild(hd);
    //Poner el contenido de table.html
    destiny_load2.appendChild(tableh);
    data.forEach((row, i)=>{
        const rowt = document.createElement("tr");
        Object.values(row).forEach((dat, j)=>{
            const td = document.createElement("td");
            td.textContent = dat;
            rowt.appendChild(td);
        });
        tableb.appendChild(rowt);
    });
    destiny_load2.appendChild(tableb);
}
//Función general para sacar la información de un método
async function connect(jmethod){
    const response = await fetch(jmethod,{
        method: 'POST',
        headers: {'Content-Type':'application/json'}
    });
    const data = await response.json();
    return data;
}