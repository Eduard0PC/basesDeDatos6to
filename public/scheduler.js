//Miniaplicación para asignar horarios
var notWithinCurrently = true;
var notOuterCurrently = false;
function getdragValues() {
    //Buscar en sch-timeline
    const timeline = document.querySelector('.sch-timeline');
    var styles = getComputedStyle(timeline);
    //Hallar las variables
    const A = styles.getPropertyValue('--value-a');
    const B = styles.getPropertyValue('--value-b');
    const emptyColor= styles.getPropertyValue('--timeprogress-background');
    const fillColor = styles.getPropertyValue('--fill-color');
    
    return {tm: timeline, A: A, B: B, ecol: emptyColor, fcol: fillColor};
}
//Checa si A>B o B>A
function changeTimelineDirection(parent, A, B, ecol, fcol) {
    if(!isWithinTimeline(A,B) && notWithinCurrently){ //Cuando A rebase a B cambian colores
        //console.log("va adentro");
        parent.style.setProperty('--fill-color', ecol);
        parent.style.setProperty('--timeprogress-background', fcol);
        notWithinCurrently = false;
        notOuterCurrently = true;
    }
    if (isWithinTimeline(A,B) && notOuterCurrently){ //Cuando A no le alcanza a B y no esta del otro lado cambian colores
        //console.log("va afuera");
        parent.style.setProperty('--fill-color', ecol);
        parent.style.setProperty('--timeprogress-background', fcol);
        notOuterCurrently = false;
        notWithinCurrently = true;
    }
}
function isWithinTimeline(A, B){
    return parseFloat(A)<=parseFloat(B);
}
//Modifica el valor al arrastrar cuando es A y B
function setValueA(parent, value){
    parent.style.setProperty('--value-a', value);
    parent.style.setProperty('--text-value-a', parsetoTime(value));
}
function setValueB(parent, value){
    parent.style.setProperty('--value-b', value);
    parent.style.setProperty('--text-value-b', parsetoTime(value));
}
//Formatea un valor a hora
function parsetoTime(value){
    const parts = value.split(".");
    var hour = '0';
    var minutes = '0';
    if (parts.length > 1){
        minutes = parts[1];
        minutes = JSON.stringify(parseFloat('0.'+minutes)*60)
    }
    hour = parts[0];
    hour = hour.padStart(2, "0");
    minutes = minutes.padStart(2, "0");
    const time = '\''+hour+':'+minutes+':'+'00\'';
    return time;
}
//Evento de arrastrar
function dragA(){
    //Primero consiguo variables para actualizar
    var values = getdragValues();
    setValueA(values.tm, this.value);
    values = getdragValues();
    changeTimelineDirection(values.tm, values.A, values.B, values.ecol, values.fcol);
    
}
function dragB(){
    //Primero consiguo variables para actualizar
    var values = getdragValues();
    setValueB(values.tm, this.value);
    values = getdragValues();
    changeTimelineDirection(values.tm, values.A, values.B, values.ecol, values.fcol);
    
}
//MAIN
document.getElementById('sch-start').addEventListener('input', dragA);
document.getElementById('sch-end').addEventListener('input', dragB);
