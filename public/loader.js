//Elimina todas las cartas y carga la tabla
export function loadEmployees(){
    //FASE 1: Borra
    removeComponent(".card-insumos");
    removeComponent(".card-ventas");
    removeComponent(".card-empleados");
    removeComponent(".card-pedidos");
    removeComponent(".card-punto-venta");
    //FASE 2: Carga
    const destiny_load = document.querySelector('.table-gen');
    fetch("table.html")
        .then(response => {
            if(response.ok){
                return response.text();
            }
        })
        .then(data=>{
            destiny_load.innerHTML=data;
        })
        .catch(error=>console.error("Error al cargar contenido: ", error));
}
//AKA Component Terminator
function removeComponent(componentname){
    const component = document.querySelector(componentname);
    component.remove();
}