import { error } from "../../../interfaces/error.js"
import { MetodoPagoI } from "../../../models/interfaces/metodosPago.js"
import { mostrarErroresConsola, tokenAcceso, urlMetodoPago } from "../global.js"
import { mostrarMensaje } from "../helpers/mostrarMensaje.js"


export const solicitudObtenerMetodosPago =async()=>{

    let metodoPagoCreado:MetodoPagoI[] = []

    await fetch(urlMetodoPago, { 
        method: 'GET',
        headers: {  'Content-Type': 'application/json' ,
            'tokenAcceso' : `${tokenAcceso}`  },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else  metodoPagoCreado = data.metodosPago // Si no hay errores entonces almacena la respuesta del servidor
    })
    .catch(error => { // Si hay un error se manejan y se muestra en consola
        mostrarMensaje('2',true);
        console.error(error);
    })

    return metodoPagoCreado
}

export const solicitudCrearMetodoPago= async(nombre:string,tipo:string)=>{

    let respuesta:{
        metodoPagoCreado:MetodoPagoI|undefined
        errors:error[]
    }={
        metodoPagoCreado: undefined,
        errors:[]
    }


    const data={
        nombre,
        tipo
    }

    await fetch(urlMetodoPago, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                    'tokenAcceso':`${tokenAcceso}`},
        body: JSON.stringify(data)
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) respuesta.errors = data.errors // Si hay errores de tipeo los muestra en consola 
        else respuesta.metodoPagoCreado = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}

export const solicitudEliminarMedioPago =async (metodoPagoNombre:string)=>{

    let respuesta:number|undefined
    await fetch(urlMetodoPago+`/${metodoPagoNombre}`, { 
        method: 'DELETE',
        headers: {  'Content-Type': 'application/json' ,
                    'tokenAcceso' : `${tokenAcceso}`  },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else respuesta = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}

export const solicitudActivarMedioPago =async (metodoPagoNombre:string)=>{

    let respuesta:number|undefined
    await fetch(urlMetodoPago+`/${metodoPagoNombre}`, { 
        method: 'PUT',
        headers: {  'Content-Type': 'application/json' ,
                    'tokenAcceso' : `${tokenAcceso}`  },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else respuesta = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}