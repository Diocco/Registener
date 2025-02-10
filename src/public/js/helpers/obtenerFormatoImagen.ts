export const obtenerFormatoImagen=(imagen64:string)=>{
    let headerImagen = imagen64.substring(0,30) // Obtiene los primeros caracteres de la imagen en formato 64

    // Determina cual es el formato original de la imagen
    if (headerImagen.includes("iVBORw0KGgo")) return  "png";
    if (headerImagen.includes("/9j/")) return  "jpeg"; 
    if (headerImagen.includes("R0lGOD")) return  "gif";
    return ""
}