import { urlConexionConServidor } from "../global.js";
import { mostrarMensaje } from "../helpers/mostrarMensaje.js";

export const conexionConServidor =async()=>{
    // Realiza la peticion GET para obtener un string[] con los nombres de las categorias validas
    let respuesta:boolean = false

    await fetch(
        urlConexionConServidor , { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        data==='0'?respuesta=true:respuesta=false
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}