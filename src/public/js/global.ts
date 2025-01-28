import { error } from "../../interfaces/error.js";
import { usuario } from "../../models/interfaces/usuario.js";
import { mostrarMensaje } from "./helpers/mostrarMensaje.js";
import { obtenerUsuarioVerificado } from "./services/usuariosAPI.js";


// Antes de todo revisa si hay que recargar la pagina
window.addEventListener("pageshow", () => {
    if (sessionStorage.getItem('recargarPagina')) {
        sessionStorage.removeItem('recargarPagina'); // Elimina la señal para evitar recargas repetidas
        location.reload(); // Recarga la página para reflejar cambios
    }
});


// Define el entorno
export let url:string = "https://registener-production.up.railway.app"

// Define los url del REST server
export const urlProductos:string = url + '/api/productos'
export const urlCategorias:string = url + '/api/categorias'
export const urlInicioSesion:string = url + '/api/auth/login'
export const urlRegistro:string = url + '/api/usuarios'
export const urlVariantes:string = url + '/api/variantes'
export const urlRegistroVentas:string = url + '/api/registroVentas'
export const urlRegistroCaja:string = url + '/api/registroCaja'
export const urlConexionConServidor:string = url + '/api/conexion';
export const urlMetodoPago:string = url + '/api/metodoPago';



// Informacion del usuario
export let usuarioVerificado: Promise<usuario | undefined>
export const tokenAcceso: string | null = localStorage.getItem('tokenAcceso') // Recupera el token de acceso desde el localStorage

if(tokenAcceso){ // Si el token existe entonces quiere decir que el usuario tiene una sesion activa
    usuarioVerificado = obtenerUsuarioVerificado(tokenAcceso)
    if(!usuarioVerificado) {
        localStorage.setItem('mostrarMensajeError',"La sesion ha caducado") // Define un mensaje de error para que sea mostrado al usuario una vez que carge la pagina a la que se redirige
        localStorage.removeItem('tokenAcceso') // Elimina el token de acceso con problemas
    }
}else{
    usuarioVerificado = new Promise((resolve)=>{resolve(undefined)})
}

export const mostrarErroresConsola =(errores:error[])=>{
    mostrarMensaje('',true);
    errores.forEach((error:error) => { // Recorre los errores
        if(error.path==='accesoToken') localStorage.removeItem('tokenAcceso') // Elimina el token de acceso con problemas
        console.log(error);
    })
}

// Revisa si hay que mostrarle un mensaje al usuario
document.addEventListener('DOMContentLoaded',()=>{
    const mensaje:string|null = localStorage.getItem('mostrarMensaje')
    if (mensaje) {
        localStorage.removeItem('mostrarMensaje'); 
        mostrarMensaje(mensaje)
    }
    const mensajeError:string|null = localStorage.getItem('mostrarMensajeError')
    if (mensajeError) {
        localStorage.removeItem('mostrarMensajeError'); 
        mostrarMensaje(mensajeError,true)
    }

    // Reinicia las variable de la seccion de venta al publico
    sessionStorage.setItem('metodoSeleccionado','')
    sessionStorage.setItem('modificacionSeleccionado','')
})

