//Utilidades
let aborter = new AbortController(); //Para 'transacciones' en tablas
//Funcion asegurar carga
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
        //Espero la carga de botones
        await generateActionsFooter('.test');
        await addtableFeat('.button-mesh-emp-control',"Acciones");
        //Añado eventos
        addEventsEmployees();
        destiny_load.style.display="flex";
    }catch (error){
        console.error("Error al cargar contenido: ", error);
    }
}
//Elimina usuarios - Funcion inestable
async function deleteUser(button) {
    const info = findInfoinRow(button, "ID del sistema");
    const format = {id: info};
    await connectnSubmit('/delete-user', format);
    //Recarga
    loadEmployees();
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
//FUNCIONES DE EVENTOS ADICIONALES
function addEventsEmployees(){
    const btn1 = document.querySelectorAll("#empDelete");
    const btn2 = document.querySelectorAll("#empQR");
    btn1.forEach(btn=>{
        btn.addEventListener('click', ()=>(deleteUser(btn)));
        btn.addEventListener('mouseover', ()=>(showMSG(btn, 'msg-handler')));
        btn.addEventListener('mouseout', ()=>(hideMSG('msg-handler')));
    });
    btn2.forEach(btn=>{
        btn.addEventListener('click', ()=>(console.log('Tonoto')));
        btn.addEventListener('mouseover', ()=>(showMSG(btn, 'msg-handler')));
        btn.addEventListener('mouseout', ()=>(hideMSG('msg-handler')));
    })
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
//Muestra mensajes
function showMSG(button, handler){
    const tooltip = document.getElementById(handler);
    const coors = button.getBoundingClientRect();
    tooltip.textContent=button.dataset.msg;
    tooltip.style.opacity=1;
    tooltip.style.display="flex";
}
//Esconde mensajes
function hideMSG(handler){
    const tooltip = document.getElementById(handler);
    tooltip.style.opacity=0;
    tooltip.style.display="none";
}
//FUNCIONES TABLAS
//Limpiar tabla
function clearTable(){
    const destiny_load = document.querySelector('.table-gen');
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
function findInfoinRow(button, headerName=null, colIndex=null){
    const locrow=button.closest("tr");
    const cells=locrow.querySelectorAll("td");
    if(colIndex!=null && colIndex<cells.lenght){
        return cells[colIndex].textContent.trim();
    }
    if(headerName!=null){
        const table = locrow.closest("table");
        const headers = table.querySelectorAll("th");
        //Inicializar
        let index = -1;
        headers.forEach((th, i) => {
            if (th.textContent.trim() === headerName) {
                index = i;
            }
        });
        if (index !== -1) {
            return cells[index].textContent.trim();
        }
    }
    return null;
}
//OTRAS COSAS
//Cargar botones para el footer de la tabla - NO TERMINADO
async function generateActionsFooter(actions){
    const destiny_load = document.querySelector('.sys-actions-footbar');
    const feat = await addActions(actions);
    destiny_load.appendChild(feat);
    return "Terminado";
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
//Función para una 'transacción'
async function connectnSubmit(jmethod, info){
    //Cancelo la solicitud anterior
    aborter.abort();
    //Reinicio el abortador
    try{
        aborter = new AbortController();
        const response = await fetch(jmethod,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(info),
            signal: aborter.signal
        });
        const data = await response.json();
        return data;
    }catch (error){
        if (error=='AbortError'){console.log("Solicitud cancelada")}
    }
}