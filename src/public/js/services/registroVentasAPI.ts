import mongoose from "mongoose"
import { RegistroVentaI } from "../../../models/interfaces/registroVentas.js"
import { mostrarErroresConsola, tokenAcceso, urlRegistroVentas } from "../global.js"
import { mostrarMensaje } from "../helpers/mostrarMensaje.js"
import { variante } from "../../../models/interfaces/variante.js"
import { ElementoCarritoI } from "../../../interfaces/elementoCarrito.js"


export const registrarVenta = async(
    total:number,
    metodo1:string,
    estado:string,
    etiqueta:string,
    pago1?:number,
    pago2?:number,
    metodo2?:string,
    lugarVenta?:string,
    descuento?:number,
    descuentoNombre?:string,
    observacion?:string,
    carrito?:ElementoCarritoI[]
):Promise<RegistroVentaI | undefined>=>{

    // Estructura la informacion y le da formato de string
    const fechaVenta = new Date()
    if(!pago1) pago1=total
    const data = JSON.stringify({
        fechaVenta,
        total,
        pago1,
        pago2,
        etiqueta,
        metodo1,
        metodo2,
        estado,
        lugarVenta,
        descuento,
        descuentoNombre,
        observacion,
        carrito
    })

    let registroVenta:RegistroVentaI|undefined = undefined

    await fetch(urlRegistroVentas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}`},
        body: data
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else registroVenta = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return registroVenta
}

export const verRegistroVentas =async(
    desde:string='',
    cantidadElementos:string='25',
    pagina:string='',
    IDVenta:string='',
    metodo:string='',
    estados:string='',
    buscarObservacion:string='',
    fechaDesde:string='',
    fechaHasta:string='',
)=>{

    let respuesta:{
        registroVentas:RegistroVentaI[],
        registroVentasCantidad:number,
        paginasCantidad:number
    }={
        registroVentas:[],
        registroVentasCantidad:0,
        paginasCantidad:0
    }



    await fetch(urlRegistroVentas+`?desde=${desde}&cantidadElementos=${cantidadElementos}&pagina=${pagina}&IDVenta=${IDVenta}&metodo=${metodo}&estados=${estados}&buscarObservacion=${buscarObservacion}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' ,
            'tokenAcceso':`${tokenAcceso}`},
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else { // Si no hay errores entonces almacena la respuesta del servidor
            respuesta = data 
        }
    })
    .catch(error => { // Si hay un error se manejan y se muestra en consola
        mostrarMensaje('2',true);
        console.error(error);
    })

    return respuesta
}

export const solicitudObtenerIngresos =async (fechaDesde:Date)=>{
    let ingresos:[{
        metodo:string,
        monto:number
    }] | undefined
    
    await fetch(urlRegistroVentas+`/ingresos/:${fechaDesde}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}`},
        })
    .then(response => response.json()) // Parsea la respuesta 
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else ingresos = data.ingresos // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return ingresos
}

export const obtenerRegistro =async (id:string)=>{
    let registro:RegistroVentaI|undefined
    
    await fetch(urlRegistroVentas+`/${id}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}`},
        })
    .then(response => response.json()) // Parsea la respuesta 
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else registro = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return registro
}

export const modificarRegistro = async (formdata:FormData)=>{
    let registroVenta:RegistroVentaI|undefined = undefined

    await fetch(urlRegistroVentas, {
        method: 'PUT',
        headers: {'tokenAcceso':`${tokenAcceso}`},
        body: formdata
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else registroVenta = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return registroVenta
}

export const eliminarRegistro = async (registroVentaID:string)=>{
    let respuesta=-1

    await fetch(urlRegistroVentas+`/${registroVentaID}`, { 
        method: 'DELETE',
        headers: {  'Content-Type': 'application/json' ,
                    'tokenAcceso' : `${tokenAcceso}`  },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else respuesta = 0 // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}