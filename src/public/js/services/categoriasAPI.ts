import { CategoriaI } from "../../../models/interfaces/categorias.js";
import { mostrarErroresConsola, tokenAcceso, urlCategorias } from "../global.js";
import { mostrarMensaje } from "../helpers/mostrarMensaje.js";

export const obtenerCategorias =async()=>{
    // Realiza la peticion GET para obtener un string[] con los nombres de las categorias validas
    let categorias:CategoriaI[]=[]

    await fetch(
        urlCategorias , { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else categorias = data.categorias // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return categorias
}

export const solicitudAgregarCategoria =async(nombreCategoria:string)=>{
    let categoriaNueva:CategoriaI|undefined

    await fetch(
        urlCategorias, { // Realiza la peticion GET para obtener un string[] con los nombres de las categorias validas
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}`},
        body: JSON.stringify({ 'nombre': `${nombreCategoria}`})
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else categoriaNueva = data.categoriaNueva // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return categoriaNueva
}