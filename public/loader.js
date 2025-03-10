//Utilidades
let aborter = new AbortController(); //Para 'transacciones' en tablas
//Funcion asegurar carga - posiblemente a deprecarse
export function garantLoad(func){
    clearTable();
    func();
}
//Regresar a Home
export async function backtoHome(){
    hideComponent(".table-gen");
    showComponent(".card-insumos");
    showComponent(".card-ventas");
    showComponent(".card-empleados");
    showComponent(".card-pedidos");
    showComponent(".card-punto-venta");
    loadOrders();
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
    //FASE 1: BORRA
    hideComponent(".card-insumos");
    hideComponent(".card-ventas");
    hideComponent(".card-empleados");
    hideComponent(".card-pedidos");
    hideComponent(".card-punto-venta");
    //FASE 2: CARGA
    try{
        const destiny_load = document.querySelector('.table-gen');
        //Carga la plantilla
        const response = await fetch("table.html");
        if(response.ok){
            destiny_load.innerHTML= await response.text();
        }
        //Contacto con la base de datos
        const info = await connect('/see-empleados');
        //Genera la tabla con el contenido
        generateTable(info.title, info.header, info.dbresults);
        generateActionsFooter('.test');
        await addtableFeat('.button-mesh-emp-control',"Acciones");
        addEventsEmployees();
        destiny_load.style.display="flex";
    }catch (error){
        console.error("Error al cargar contenido: ", error);
    }
}
//Añadir botones
async function addActions(button){
    try{
        const actions = document.createElement("div");
        const response = await fetch("buttons.html");
        if(response.ok){
            actions.innerHTML = await response.text();
        }
        const target = actions.querySelector(button);
        return target.cloneNode(true);
    }catch(error){
        console.error("Error al cargar contenido: ", error);
    }
}
function addEventsEmployees(){
    const btn1 = document.querySelectorAll('.button-mesh-emp-control');
    console.log(btn1);
    if (btn1){
        //btn1[0].addEventListener('click', ()=>(console.log("Jijija")));
    }
}
//FUNCIONES DE COMPONENTES
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
//FUNCIONES TABLAS
//Limpiar tabla
function clearTable(){
    const destiny_load = document.querySelector('.table-gen');
    //console.log(destiny_load);
    destiny_load.innerHTML='';
} 
//Generar tabla
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
//Poner columna adicional y funcionalidad custom
async function addtableFeat(actions, headtitle){
    //Buscar en table.html
    const destiny_load = document.querySelector('.sys-table');
    const thd = destiny_load.querySelector('thead');
    const tbd = destiny_load.querySelector('tbody');
    
    //Crear elementos
    const newth = document.createElement("th"); //Nuevo encabezado
    newth.textContent=headtitle; //Set titulo
    thd.rows[0].appendChild(newth); //Añadir encabezado a la tabla
    //Uso este for en lugar del ForEach para que tenga que esperar
    for(const r of tbd.rows){
        const newbd = document.createElement("td"); //Nuevo espacio
        const feat = await addActions(actions);
        newbd.appendChild(feat);
        r.appendChild(newbd)
    }
    //Aterrizar para que la función espere
    return "Terminado";
}
//Cargar botones para el footer de la tabla
function generateActionsFooter(actions){
    const destiny_load = document.querySelector('.sys-actions-footbar');
    addActions(actions).then(acts=>{
        if (acts){
            destiny_load.appendChild(acts);
        }   
    });
}
//Función general para sacar la información de un método
async function connect(jmethod){
    //Cancelo la solicitud anterior
    aborter.abort();
    //Reinicio el abortador
    try{
        aborter = new AbortController();
        const response = await fetch(jmethod,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            signal: aborter.signal
        });
        const data = await response.json();
        return data;
    }catch (error){
        if (error=='AbortError'){console.log("Solicitud cancelada")}
    }
}