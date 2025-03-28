/*GENERALIDADES PENDIENTES
-Refactorizacion en carga de funcionalidades
-Integrar hide/show en una sola funcion (generalizar para cualquier elemento)
-Reestringir funciones para que nadie pueda inyectar asi de facil codigo
-Evitar que el codigo se repita en Sources aunque no es necesario*/

//Utilidades
let aborter = new AbortController(); //Para 'transacciones' en tablas

//Funcion asegurar carga
export function garantLoad(func){
    clearTable();
    clearForms();
    hideOverlay();
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
    showMainScroll();
    closeMiniApps();
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
    hideMainScroll();
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
        //CARGA DE COMPONENTES
        //Genera la tabla con el contenido
        generateTable(info.title, info.header, info.dbresults);
        await addtableFeat('.button-mesh-emp-control',"Acciones");
        //Genera acciones del pie de página
        await generateActionsFooter('.std-button-emps');
        //Genera los formularios y cosas relacionadas
        await generateForm('.add-emp-form');
        await loadMiniApp('scheduler');
        //Añado eventos
        addEventsEmployees();
        destiny_load.style.display="flex";
    }catch (error){
        console.error("Error al cargar contenido: ", error);
    }
}

//Carga ventas
export async function loadSales(){
    //FASE 1: Borra
    hideComponent(".card-insumos");
    hideComponent(".card-ventas");
    hideComponent(".card-empleados");
    hideComponent(".card-pedidos");
    hideComponent(".card-punto-venta");
    hideMainScroll();
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
            return connect('/see-ventas');
        })
        .then(info=>{
            //Carga la información de la tabla
            generateTable(info.title, info.header, info.dbresults);
            //Mostrar
            destiny_load.style.display="flex";
        })
        .catch(error=>console.error("Error al cargar contenido: ", error));
}

//Carga insumos
export async function loadFood(){
    //FASE 1: Borra
    hideComponent(".card-insumos");
    hideComponent(".card-ventas");
    hideComponent(".card-empleados");
    hideComponent(".card-pedidos");
    hideComponent(".card-punto-venta");
    hideMainScroll();
    //FASE 2: CARGA
    try{
        const destiny_load = document.querySelector('.table-gen');
        //Carga la plantilla
        const response = await fetch("table.html");
        if(response.ok){
            destiny_load.innerHTML= await response.text();
        }
        //Contacto con la base de datos
        const info = await connect('/see-insumos');
        //Genera la tabla con el contenido
        generateTable(info.title, info.header, info.dbresults);
        //Espero la carga de botones
        await generateActionsFooter('.standard-buttons');
        destiny_load.style.display="flex";
    }catch (error){
        console.error("Error al cargar contenido: ", error);
    }
}

//Carga miniapps
async function loadMiniApp(miniapp){
    function createNewScript() {
        //setup del script
        let script = document.createElement("script");
        script.classList = "miniapp";
        script.type = "module";
        //Asegura que el script no se guarde el cache - me falta contexto
        script.src = miniapp+'.js' + '?t='+new Date().getTime();
        script.defer = true;
        document.head.appendChild(script);
    }
    try{
        const container = document.querySelectorAll(miniapp);
        const response = await fetch(miniapp+'.html');
        if(response.ok){
            for (const minapp of container) {
                minapp.innerHTML = await response.text();
            }
        }
        //Busca el script que se acabo de generar y lo destruyo, luego lo vuelvo a crear
        const oldScript = document.querySelector('script[src^="'+miniapp+'.js"]');
        if(oldScript){
            oldScript.remove();
        }
        createNewScript();  
    }catch(error){
        console.error("Error al cargar aplicación: ", error);
    }
}

//Cierra todas las apps
function closeMiniApps(){
    const minapps = document.querySelectorAll('.miniapp');
    for(const minapp of minapps) {
        minapp.remove();
    }
}

//Elimina usuarios - Funcion inestable - Cuidado con clickear
async function deleteUser(button) {
    const info = findInfoinRow(button, "ID del sistema");
    const format = {id: info};
    await connectnSubmit('/delete-user', format);
    //Recarga
    garantLoad(()=>(loadEmployees()));
}

//Genera QR
async function generateQR(button) {
    const idEmpleado = findInfoinRow(button, "ID del sistema"); // Obtiene el ID de la fila
    if (!idEmpleado) return alert("No se pudo obtener el ID del empleado");
    try {
        const data = await connectnSubmit('/generate-qr', {id: idEmpleado});
        if (data.qrCode) {
            // Crear y mostrar la imagen del QR en un contenedor
            const qrImage = document.getElementById("qr-image");
            qrImage.src = data.qrCode;  // Asigna la URL del QR a una imagen
            showPopUp('#qr-container');
            addEventsQR();
        } else {
            alert("Error al generar el QR");
        }
    } catch (error) {
        console.error("Error al obtener el QR:", error);
    }
}

//Añade usuarios - Pendiente - falta validacion
async function addUser(event) {
    event.preventDefault();
    const filter = /^['"]|['"]$/g;
    const style = getComputedStyle(document.querySelector('.sch-timeline'));
    const username = document.getElementById('nwuser').value;
    const password = document.getElementById('nwpswd').value;
    const role = document.getElementById('nwrole').value;
    const schstart = style.getPropertyValue('--text-value-a').replaceAll(filter, '');
    const schend = style.getPropertyValue('--text-value-b').replaceAll(filter, '');
    const format= {username: username, pswd: password, role: role, hinit: schstart, hfinale: schend};
    await connectnSubmit('/add-user', format);
    //Recarga
    garantLoad(()=>(loadEmployees()));
}

//Muestra el formulario en cuestion
function showForm(form) {
    const destiny_load = document.querySelector('.'+form);
    showOverlay();
    destiny_load.style.display="flex";
}

//Oculta el formulario en cuestión
function closeForm(form) {
    const destiny_load = document.querySelector('.'+form)
    hideOverlay();
    destiny_load.style.display="none";
}

//Cierra todos los formularios y se tienen que volver a cargar las apps
function clearForms() {
    const target = document.querySelector('.sys-forms');
    target.innerHTML='';
}

//Añadir formulario
async function addForm(form){
    try{
        const actions = document.createElement("div");
        const response = await fetch("forms.html");
        if(response.ok){
            actions.innerHTML = await response.text();
        }
        const target = actions.querySelector(form);
        return target.cloneNode(true);
    }catch(error){
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

//FUNCIONES DE EVENTOS ADICIONALES
function addEventsEmployees(){
    const btn1 = document.querySelectorAll("#empDelete");
    const btn2 = document.querySelectorAll("#empQR");
    const btn3 = document.getElementById("empAdd");
    const btn4 = document.getElementById("empAddClose");
    const form = document.querySelector('.add-emp-form');
    btn1.forEach(btn=>{
        btn.addEventListener('click', ()=>(deleteUser(btn)));
        btn.addEventListener('mouseover', ()=>(showMSG(btn, 'msg-handler')));
        btn.addEventListener('mouseout', ()=>(hideMSG('msg-handler')));
    });
    btn2.forEach(btn=>{
        btn.addEventListener('click', ()=>(generateQR(btn)));
        btn.addEventListener('mouseover', ()=>(showMSG(btn, 'msg-handler')));
        btn.addEventListener('mouseout', ()=>(hideMSG('msg-handler')));
    })
    btn3.addEventListener('click', ()=>(showForm('add-emp-form')));
    btn4.addEventListener('click', ()=>(closeForm('add-emp-form')));
    form.addEventListener('submit', (event)=>(addUser(event)));
}

function addEventsQR(){
    const qrbtn1 = document.getElementById("button-close-qr");
    qrbtn1.addEventListener('click', ()=>(hidePopUp('#qr-container')));
}

//Muestra mensajes
function showMSG(button, handler){
    const tooltip = document.getElementById(handler);
    const coors = button.getBoundingClientRect();
    tooltip.textContent=button.dataset.msg;
    tooltip.style.opacity=1;
}

//Esconde mensajes
function hideMSG(handler){
    const tooltip = document.getElementById(handler);
    tooltip.style.opacity=0;
}

//Muestra ventanas flotantes
function showPopUp(componentname){
    const component = document.querySelector(componentname);
    component.style.scale=1;
}
function hidePopUp(componentname){
    const component = document.querySelector(componentname);
    component.style.scale=0;
}

//AKA Component birthmaker - Buffed
function showComponent(componentname){
    const component = document.querySelector(componentname);
    component.style.display="flex";
}

//AKA Component Terminator - Nerfed
function hideComponent(componentname){
    const component = document.querySelector(componentname);
    component.style.display="none";
}

//Cosos de scroll
function showMainScroll(){
    document.body.style.overflow="auto";
}
function hideMainScroll(){
    document.body.style.overflow="hidden";
}

//Cosas del overlay
function showOverlay(){
    const ly = document.querySelector('.obscure-background-overlay');
    ly.style.display="flex";
}

function hideOverlay(){
    const ly = document.querySelector('.obscure-background-overlay');
    ly.style.display="none";
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

//Encuentra un data según el boton, encabezado/columna
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
//Cargar botones para el footer de la tabla
async function generateActionsFooter(actions){
    const destiny_load = document.querySelector('.sys-actions-footbar');
    const feat = await addActions(actions);
    destiny_load.appendChild(feat);
    return "Terminado";
}

//Cargar botones para los formularios
async function generateForm(form){
    const destiny_load = document.querySelector('.sys-forms');
    const feat = await addForm(form);
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

//Función para entregar datos y ejecutar un método
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
