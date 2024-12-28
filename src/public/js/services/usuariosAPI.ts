import { error } from "../../../interfaces/error.js";
import { producto } from "../../../models/interfaces/producto.js";
import { usuario } from "../../../models/interfaces/usuario.js";
import { mostrarErroresConsola, tokenAcceso, url, urlInicioSesion, urlRegistro } from "../global.js";
import { mostrarMensaje } from "../helpers/mostrarMensaje.js";

export const obtenerUsuarioVerificado = async (tokenAcceso:string)=>{
    let usuarioVerificado:usuario|undefined
    await fetch(url+'/api/usuarios/token', {  // Solicita la informacion del usuario
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
                    'tokenAcceso':`${tokenAcceso}`},
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola(data.errors) // Si hay errores de tipeo los muestra en consola 
        else usuarioVerificado=data.usuarioVerificado // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
    })

    return usuarioVerificado
}

export const solicitudIniciarSesion =async(correo:string,password:string)=>{

    const data={ // Define los parametros inputs por el usuario para enviarlos al servidor
        correo,
        password
    }

    let respuesta: {
        errors:error[],
        token:string
    }={
        errors: [],
        token: ""
    }

    await fetch(urlInicioSesion, { // Realiza el post
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) // Convertir los datos a JSON
    })

    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
        if(data.errors) respuesta.errors=data.errors
        else respuesta.token = data.token
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
    })
    return respuesta
}

export const solicitudRegistrarUsuario=async (nombre:string,password:string,correo:string)=>{

    const data={ // Define los parametros inputs por el usuario para enviarlos al servidor
        nombre,
        password,
        correo,
        google:'false'
    }

    let respuesta: {
        errors:error[],
        token:string
    }={
        errors: [],
        token: ""
    }

    await fetch(urlRegistro, { // Realiza el post
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) // Convertir los datos a JSON
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
        if(data.errors) respuesta.errors=data.errors
        else respuesta.token = data.token
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
    })

    return respuesta
}

export const obtenerListaDeseados=async(productoCompleto:boolean=true)=>{
    let respuesta: {
        errors:error[],
        productos:producto[]|string[]
    }={
        errors: [],
        productos: []
    }

    await fetch(url+`/api/usuarios/listaDeseados?productoCompleto=${productoCompleto}`,{ 
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}` // Envia el token de acceso del usuario
        },
        })
        .then(response => response.json()) // Parsea la respuesta 
        .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
            if(data.errors) respuesta.errors=data.errors
            else respuesta.productos = data
        })
        .catch(error => { // Si hay un error se manejan 
            mostrarMensaje('2',true);
            console.error(error);
        })
    
    return respuesta
}

export const solicitudAlternarProductoDeseado=async(productoId:string)=>{
    let respuesta: {
        errors:error[],
    }={
        errors: [],
    }

    await fetch(url+`/api/usuarios/listaDeseados/${productoId}`,{ // Envia el id del producto como un queryparam
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
            'tokenAcceso':`${tokenAcceso}` // Envia el token de acceso del usuario
        }
    })
    .then(response=>response.json())
    .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
        if(data.errors) respuesta.errors=data.errors
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
    })

    return respuesta
}

export const solicitudActualizarUsuario =async(datosFormulario:FormData)=>{
    let respuesta: {errors:error[]}={errors: []}

    await fetch(url+`/api/usuarios`, {
        method: 'PUT',
        headers: { 'tokenAcceso':`${tokenAcceso}`},
        body: datosFormulario
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> {if(data.errors) respuesta.errors=data.errors }) // Si todo sale bien se maneja la respuesta del servidor
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })
    return respuesta
}