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
    showGrid(".allcards");
    showMainScroll();
    closeMiniApps();
}

//Carga pedidos - Para estas funciones elimina el menu y carga la tabla
export async function loadOrders() {
    const destiny_load = document.querySelector(".card-pedidos");
    try {
        // Load the table template
        const response = await fetch("table.html");
        if (response.ok) {
            destiny_load.innerHTML = await response.text();
        }

        // Fetch orders data
        const info = await connect("/see-pedidos");

        // Generate the table
        generateTable("card-pedidos", info.title, info.header, info.dbresults);

        // Add footer buttons
        const footer = document.createElement("div");
        footer.classList.add("sys-actions-footbar");
        footer.innerHTML = `
            <button id="markDelivered" class="deliver-button accept">Marcar como entregado</button>
        `;
        destiny_load.appendChild(footer);

        // Add event listeners
        addEventsPedidos();
        destiny_load.style.display = "flex";
    } catch (error) {
        console.error("Error al cargar contenido: ", error);
    }
}

function addEventsPedidos() {
    const markDeliveredButton = document.getElementById("markDelivered");

    markDeliveredButton.addEventListener("click", async () => {
        const selectedRow = document.querySelector(".card-pedidos .sys-table tr.selected-row"); // Find the selected row
        if (!selectedRow) {
            alert("Seleccione un pedido para marcar como entregado.");
            return;
        }

        const id_pedido = findInfoinRow(selectedRow, "ID Pedido"); // Get the ID of the selected row
        if (!id_pedido) {
            alert("No se pudo obtener el ID del pedido.");
            return;
        }

        if (confirm("¿Está seguro de marcar este pedido como entregado?")) {
            try {
                await connectnSubmit("/delete-pedido", { id_pedido });
                selectedRow.remove(); // Remove the row from the table
                alert("Pedido marcado como entregado.");
            } catch (error) {
                console.error("Error al marcar como entregado:", error);
                alert("Hubo un error al marcar el pedido como entregado.");
            }
        }
    });
}

//Carga empleados
export async function loadEmployees(){
    //FASE 1: BORRA
    hideComponent(".allcards");
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
        generateTable('table-gen', info.title, info.header, info.dbresults);
        await addtableFeat('.button-mesh-emp-control',"Acciones");
        //Genera acciones del pie de página
        await generateActionsFooter('table-gen','.std-buttons.emps');
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
export async function loadSales() {
    // FASE 1: Clear previous content
    hideComponent(".allcards");
    hideMainScroll();

    // FASE 2: Load new content
    try {
        const destiny_load = document.querySelector(".table-gen");
        const response = await fetch("table.html");
        if (response.ok) {
            destiny_load.innerHTML = await response.text();
        }

        // Fetch sales data
        const info = await connect("/see-ventas");

        // Generate the table
        generateTable("table-gen", info.title, info.header, info.dbresults);

        // Add footer buttons and forms
        await generateActionsFooter("table-gen", ".std-buttons-ins.ven");
        await generateForm(".add-plato-form");
        await generateForm(".edit-plato-form");
        await generateForm(".add-pedido-form");
        addEventsVentas();
        destiny_load.style.display = "flex";
    } catch (error) {
        console.error("Error al cargar contenido: ", error);
    }
}

//Carga insumos
export async function loadFood() {
    // FASE 1: Borra
    hideComponent(".allcards");
    hideMainScroll();
    // FASE 2: CARGA
    try {
        const destiny_load = document.querySelector(".table-gen");
        // Carga la plantilla
        const response = await fetch("table.html");
        if (response.ok) {
            destiny_load.innerHTML = await response.text();
        }
        // Contacto con la base de datos
        const info = await connect("/see-insumos");
        // Genera la tabla con el contenido
        generateTable("table-gen", info.title, info.header, info.dbresults);
        // Espero la carga de botones
        await generateActionsFooter('table-gen', '.std-buttons-ins.ins');
        await generateForm('.add-insumo-form');
        await generateForm('.edit-insumo-form');
        addEventsInsumos();
        destiny_load.style.display = "flex";
    } catch (error) {
        console.error("Error al cargar contenido: ", error);
    }
}

//Carga las entradas y salidas de empleados
async function loadTimeEmployees(){
    try{
        const destiny_load = document.querySelector('.table-gen');
        //Carga la plantilla
        const response = await fetch("table.html");
        if(response.ok){
            destiny_load.innerHTML= await response.text();
        }
        //Contacto con la base de datos
        const info = await connect('/see-time-empleados');
        //CARGA DE COMPONENTES
        //Genera la tabla con el contenido
        generateTable('table-gen', info.title, info.header, info.dbresults);
        //Genera acciones del pie de página
        await generateActionsFooter('table-gen', '.std-buttons.timeemps');
        //Añado eventos
        addEventsTimeEmployees();
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

async function AddIns(button) {
    const info = findInfoinRow(button, "ID del sistema");
    const format = {id: info};
    await connectnSubmit('/add-insumos', format);
    //Recarga
    garantLoad(()=>(loadFood()));
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

//Añade usuarios - Falta validacion robusta
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
    destiny_load.style.display="flex";
    showOverlay();
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
    const btn5 = document.getElementById("empTime");
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
    btn5.addEventListener('click', ()=>(loadTimeEmployees()));
    form.addEventListener('submit', (event)=>(addUser(event)));
}

function addEventsTimeEmployees(){
    const btn1 = document.getElementById("empBack");
    btn1.addEventListener('click', ()=>(loadEmployees()));
}

function addEventsQR(){
    const qrbtn1 = document.getElementById("button-close-qr");
    qrbtn1.addEventListener('click', ()=>(hidePopUp('#qr-container')));
}

function addEventsInsumos() {
    const addButton = document.getElementById("addButton");
    const editButton = document.getElementById("editButton");
    const deleteButton = document.getElementById("deleteButton");
    const addForm = document.querySelector(".add-insumo-form");
    const editForm = document.querySelector(".edit-insumo-form");
    const searchBar = document.getElementById("searchBar");

    // Add Insumo Button
    addButton.addEventListener("click", () => showForm("add-insumo-form"));
    document.getElementById("addInsumoClose").addEventListener("click", () => closeForm("add-insumo-form"));

    // Edit Insumo Button
    editButton.addEventListener("click", () => {
        const selectedRow = document.querySelector(".sys-table tr.selected-row"); // Find the selected row
        if (!selectedRow) {
            alert("Seleccione un insumo para editar. Tonotito");
            return;
        }

        // Populate Edit Form
        const id = findInfoinRow(selectedRow, "ID del sistema");
        const name = findInfoinRow(selectedRow, "Nombre");
        const unit = findInfoinRow(selectedRow, "Unidad de medida");
        const expiry = findInfoinRow(selectedRow, "Fecha de Caducidad");
        const quantity = findInfoinRow(selectedRow, "Cantidad restante");

        // Fill form fields
        document.getElementById("editInsumoId").value = id;
        document.getElementById("editInsumoName").value = name;
        document.getElementById("editInsumoUnit").value = unit;
        document.getElementById("editInsumoExpiry").value = expiry;
        document.getElementById("editInsumoQuantity").value = quantity;

        showForm("edit-insumo-form");
    });

    document.getElementById("editInsumoClose").addEventListener("click", () => closeForm("edit-insumo-form"));

    // Delete Insumo Button
    deleteButton.addEventListener("click", async () => {
        const selectedRow = document.querySelector(".sys-table tr.selected-row"); // Find the selected row
        if (!selectedRow) {
            alert("Seleccione un insumo para eliminar. Tonotote");
            return;
        }

        const id_insumo = findInfoinRow(selectedRow, "ID del sistema");
        if (confirm("¿Está seguro de eliminar este insumo?")) {
            await connectnSubmit("/delete-insumos", { id_insumo });
            garantLoad(() => loadFood());
        }
    });

    async function connect(url, data = {}) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    
        if (!response.ok) {
            console.error("Error fetching data:", response.statusText);
            return null;
        }
    
        return await response.json();
    }
    
    // Example usage for live search
    searchBar.addEventListener("input", async () => {
        const searchTerm = searchBar.value.trim();
        const info = await connect("/search-insumos", { searchTerm });
        if (info) {
            generateTable("table-gen", info.title, info.header, info.dbresults);
        }
    });

    // Form Submit Handlers
    addForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nombre_insumo = document.getElementById("insumoName").value;
        const unidad_medida = document.getElementById("insumoUnit").value;
        const caducidad = document.getElementById("insumoExpiry").value;
        const cantidad = document.getElementById("insumoQuantity").value;

        await connectnSubmit("/add-insumos", { nombre_insumo, unidad_medida, caducidad, cantidad });
        garantLoad(() => loadFood());
    });

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const id_insumo = document.getElementById("editInsumoId").value;
        const nombre_insumo = document.getElementById("editInsumoName").value;
        const unidad_medida = document.getElementById("editInsumoUnit").value;
        const caducidad = document.getElementById("editInsumoExpiry").value;
        const cantidad = document.getElementById("editInsumoQuantity").value;

        await connectnSubmit("/edit-insumos", { id_insumo, nombre_insumo, unidad_medida, caducidad, cantidad });
        garantLoad(() => loadFood());
    });
}

function addEventsVentas() {
    const addButton = document.getElementById("addPButton");
    const editButton = document.getElementById("editPButton");
    const deleteButton = document.getElementById("deletePButton");
    const addForm = document.querySelector(".add-plato-form");
    const editForm = document.querySelector(".edit-plato-form");
    const pedidoForm = document.querySelector(".add-pedido-form");
    const searchBar = document.getElementById("searchPBar");
    const addPedido = document.getElementById("addPedido");

    // Add Insumo Button
    addButton.addEventListener("click", () => showForm("add-plato-form"));
    document.getElementById("addPlatoClose").addEventListener("click", () => closeForm("add-plato-form"));

    // Add Pedido Button
    // Add Pedido Button
    addPedido.addEventListener("click", async () => {
        await populateAlimentosDropdown();
        showForm("add-pedido-form");
    });

    document.getElementById("addPedidoClose").addEventListener("click", () => closeForm("add-pedido-form"));

    // Edit Insumo Button
    editButton.addEventListener("click", () => {
        const selectedRow = document.querySelector(".sys-table tr.selected-row"); // Find the selected row
        if (!selectedRow) {
            alert("Seleccione un plato para editar. Tonotito");
            return;
        }

        // Populate Edit Form
        const id = findInfoinRow(selectedRow, "ID del alimento");
        const name = findInfoinRow(selectedRow, "Nombre del plato");
        const price = findInfoinRow(selectedRow, "Precio");

        // Fill form fields
        document.getElementById("editPlatoId").value = id;
        document.getElementById("editPlatoNombre").value = name;
        document.getElementById("editPlatoPrecio").value = price;

        showForm("edit-plato-form");
    });

    document.getElementById("editPlatoClose").addEventListener("click", () => closeForm("edit-plato-form"));

    // Delete Insumo Button
    deleteButton.addEventListener("click", async () => {
        const selectedRow = document.querySelector(".sys-table tr.selected-row"); // Find the selected row
        if (!selectedRow) {
            alert("Seleccione un plato para eliminar. Tonotote");
            return;
        }

        const id_alimento = findInfoinRow(selectedRow, "ID del alimento");
        if (confirm("¿Está seguro de eliminar este plato?")) {
            await connectnSubmit("/delete-ventas", { id_alimento });
            garantLoad(() => loadSales());
        }
    });

    async function connect(url, data = {}) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    
        if (!response.ok) {
            console.error("Error fetching data:", response.statusText);
            return null;
        }
    
        return await response.json();
    }
    
    // Example usage for live search
    searchBar.addEventListener("input", async () => {
        const searchTerm = searchBar.value.trim();
        const info = await connect("/search-ventas ", { searchTerm });
        if (info) {
            generateTable("table-gen", info.title, info.header, info.dbresults);
        }
    });

    // Form Submit Handlers
    addForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nombre_alimento = document.getElementById("platoNombre").value;
        const precio_alimento = document.getElementById("platoPrecio").value;

        await connectnSubmit("/add-ventas", { nombre_alimento, precio_alimento });
        garantLoad(() => loadSales());
    });

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const id_alimento = document.getElementById("editPlatoId").value;
        const nombre_alimento = document.getElementById("editPlatoNombre").value;
        const precio_alimento = document.getElementById("editPlatoPrecio").value;

        await connectnSubmit("/edit-ventas", { id_alimento, nombre_alimento, precio_alimento });
        garantLoad(() => loadSales());
    });

    // Handle Pedido Form Submission
    pedidoForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombreCliente = document.getElementById("nombreCliente").value;
        const direccion = document.getElementById("direccion").value;

        const alimentos = Array.from(document.querySelectorAll(".alimento-entry")).map(entry => {
            return {
                id_alimento: entry.querySelector(".alimento").value,
                cantidad: entry.querySelector(".cantidad").value,
                total: parseFloat(entry.querySelector(".total").value.replace("$", ""))
            };
        });

        const payload = {
            nombre_cliente: nombreCliente,
            direccion: direccion,
            alimentos: alimentos
        };

        try {
            await fetch("/add-pedido", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            alert("Pedido realizado con éxito");
            garantLoad(() => loadSales());
        } catch (error) {
            console.error("Error al realizar el pedido:", error);
            alert("Hubo un error al realizar el pedido.");
        }
    });
    
}

// Fetch Alimentos from the server
async function fetchAlimentos() {
    const response = await fetch("/get-alimentos");
    if (!response.ok) {
        console.error("Error fetching alimentos:", response.statusText);
        return [];
    }
    return await response.json();
}

// Populate the Alimentos dropdown
async function populateAlimentosDropdown() {
    const alimentos = await fetchAlimentos();
    const alimentosContainer = document.getElementById("alimentosContainer");

    // Clear existing entries
    alimentosContainer.innerHTML = "";

    // Add a default Alimento entry
    const alimentoEntry = createAlimentoEntry(alimentos);
    alimentosContainer.appendChild(alimentoEntry);

    // Add functionality to dynamically add more Alimento entries
    document.getElementById("addAlimento").addEventListener("click", () => {
        const newEntry = createAlimentoEntry(alimentos);
        alimentosContainer.appendChild(newEntry);
    });
}

// Create a single Alimento entry
function createAlimentoEntry(alimentos) {
    const alimentoEntry = document.createElement("div");
    alimentoEntry.classList.add("alimento-entry");

    alimentoEntry.innerHTML = `
        <label for="alimento">Alimento:</label>
        <select class="alimento" required>
            ${alimentos.map(alimento => `
                <option value="${alimento.id_alimento}" data-precio="${alimento.precio}">
                    ${alimento.nombre_alimento} - $${alimento.precio}
                </option>
            `).join("")}
        </select>
        <label for="cantidad">Cantidad:</label>
        <input type="number" class="cantidad" min="1" required>
        <label for="total">Total:</label>
        <input type="text" class="total" readonly>
        <button type="button" class="remove-alimento">Eliminar</button>
    `;

    // Add event listener to calculate total when quantity changes
    const selectElement = alimentoEntry.querySelector(".alimento");
    const cantidadInput = alimentoEntry.querySelector(".cantidad");
    const totalInput = alimentoEntry.querySelector(".total");

    cantidadInput.addEventListener("input", () => {
        const precio = selectElement.options[selectElement.selectedIndex].dataset.precio;
        const cantidad = cantidadInput.value;
        totalInput.value = `$${(cantidad * precio).toFixed(2)}`;
    });

    // Add event listener to remove the entry
    alimentoEntry.querySelector(".remove-alimento").addEventListener("click", () => {
        alimentoEntry.remove();
    });

    return alimentoEntry;
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
    component.style.transform='scale(1)';
}
function hidePopUp(componentname){
    const component = document.querySelector(componentname);
    component.style.transform='scale(0)';
}

//Muestra el tablero correctamente
function showGrid(grid) {
    const sgrid = document.querySelector(grid);
    sgrid.style.display="grid";
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

//Nose si vaya a necesitar estas funciones después
function clearInnerTable(section, table){
    const destiny_load = document.querySelector('.'+section+' .'+table);
    destiny_load.innerHTML='';
}

//Generar tabla - Quizas necesite una modificacion
function generateTable(section, title, header, data) {
    const titleEl = document.querySelector('.' + section + ' .table-title');
    const tableEl = document.querySelector('.' + section + ' .sys-table');  

    // Clear any previously selected rows
    document.querySelectorAll('.sys-table tr.selected-row').forEach(row => {
        row.classList.remove('selected-row');
    });

    // set title
    titleEl.textContent = title;    

    // build thead
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    header.forEach(colName => {
      const th = document.createElement('th');
      th.textContent = colName;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow); 

    // build tbody
    const tbody = document.createElement('tbody');

    // find which column is the quantity
    const qtyColIndex = header.indexOf("Cantidad restante");    
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.addEventListener('click', () => {
        // Deselect other rows
        document.querySelectorAll('.sys-table tr').forEach(r => r.classList.remove('selected-row'));
        tr.classList.add('selected-row');
        });

      // only take as many values as you have headers
      const vals = Object.values(row).slice(0, header.length);  
      vals.forEach((val, idx) => {
        const td = document.createElement('td');
        td.textContent = val;

        // if this is the "Cantidad restante" column _and_ flagged low stock, add your class
        if (idx === qtyColIndex && row.noStock) {
          td.classList.add('no-stock');
        }else if (idx === qtyColIndex && row.isLowStock) {
          td.classList.add('low-stock');
        }else if (idx === qtyColIndex && row.isMedStock) {
          td.classList.add('mid-stock');
        }else if (idx === qtyColIndex && row.isHighStock) {
          td.classList.add('high-stock');
        }
        tr.appendChild(td);
      });   
      tbody.appendChild(tr);
    }); 
    
    // replace any old content
    tableEl.innerHTML = '';
    tableEl.appendChild(thead);
    tableEl.appendChild(tbody);
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
    if(colIndex!=null && colIndex<cells.length){
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
async function generateActionsFooter(section, actions){
    const destiny_load = document.querySelector('.'+section+' .sys-actions-footbar');
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
