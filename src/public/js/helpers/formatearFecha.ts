export const obtenerFechaActual=(fecha?:Date)=>{
    let ahora
    if(fecha) ahora = new Date(fecha);
    else ahora = new Date();

    const dia = String(ahora.getDate()).padStart(2, '0'); // Día con dos dígitos
    const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Mes (de 0 a 11)
    const anio = ahora.getFullYear(); // Año

    const horas = String(ahora.getHours()).padStart(2, '0'); // Horas con dos dígitos
    const minutos = String(ahora.getMinutes()).padStart(2, '0'); // Minutos con dos dígitos

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}