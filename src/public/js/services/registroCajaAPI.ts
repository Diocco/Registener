import { MediosDePagoI, RegistroCajaI } from "../../../models/interfaces/registroCaja.js"
import { mostrarErroresConsola, tokenAcceso, urlRegistroCaja } from "../global.js"
import { mostrarMensaje } from "../helpers/mostrarMensaje.js"

export const solicitudRegistrarCaja = async(
    fechaApertura:Date,
    fechaCierre:Date,
    usuarioApertura:string,
    usuarioCierre:string,
    mediosDePago:[MediosDePagoI],
    observacion?:string
):Promise<MediosDePagoI | undefined>=>{

    // Estructura la informacion y le da formato de string
    const data = JSON.stringify({
        fechaApertura,
        fechaCierre,
        usuarioApertura,
        usuarioCierre,
        mediosDePago,
        observacion
    })

    let registroCaja:MediosDePagoI|undefined = undefined

    await fetch(urlRegistroCaja, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}`},
        body: data
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else registroCaja = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return registroCaja
}

export const solicitudObtenerRegistrosCaja =async(
    desde:string='',
    cantidadElementos:string='25',
    pagina:string='',
    fechaDesde:string='',
    fechaHasta:string='',
)=>{

    let respuesta:{
        registroCaja:RegistroCajaI[],
        registroCajaCantidad:number,
        paginasCantidad:number
    }={
        registroCaja:[],
        registroCajaCantidad:0,
        paginasCantidad:0
    }



    await fetch(urlRegistroCaja+`?desde=${desde}&cantidadElementos=${cantidadElementos}&pagina=${pagina}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`, { 
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