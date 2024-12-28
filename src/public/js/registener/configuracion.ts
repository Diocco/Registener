import { metodosPago } from "../registener/index.js";
import { MetodoPagoI } from "../../../models/interfaces/metodosPago.js";
import { mostrarMensaje } from "../helpers/mostrarMensaje.js";
import { solicitudActivarMedioPago, solicitudCrearMetodoPago, solicitudEliminarMedioPago, solicitudObtenerMetodosPago } from "../services/metodosPagoAPI.js";
import { cargarSeccionCaja } from "./seccionCaja.js";
import { cargarBotonesVentaPublico } from "./ventaPublico.js";
import { preguntar } from "./ventanasEmergentes/preguntar.js";

export const cargarSeccionConfiguracion=()=>{
    cargarMetodosPago()
    asignarBotonAgregarMetodo()
}

/* Configuracion de los metodos de pago */
const cargarMetodosPago=()=>{
    const contendorMetodos = document.getElementById('configuracion__caja__metodos')!
    const botonAgregarMetodo = document.getElementById('configuracion__caja__metodos-agregar')!

    botonAgregarMetodo.classList.remove('noActivo') // Activa el boton para agregar metodos de pago
    contendorMetodos.innerHTML='' // Vacia el contenedor
    

    metodosPago.forEach(metodo=>{
        const metodoDIV = document.createElement('div')
        metodoDIV.innerHTML=`
        <div class="configuracion__caja__metodos-fila">
            <div class="configuracion__caja__metodos-nombre">${metodo.nombre}</div>
            <div>${metodo.tipo}</div>
            ${metodo.estado?`
            <button class="configuracion__caja__metodos-eliminar boton__negativo botonRegistener3 ">
                <i class="fa-solid fa-trash-can " aria-hidden="true"></i>
            </button>`:`
            <button class="configuracion__caja__metodos-activar botonRegistener3 ">
                <i class="fa-solid fa-circle-up"></i>
            </button>
                `}
            
        </div>
        `
        contendorMetodos.appendChild(metodoDIV)
    })
    
    botonesEliminarMetodo()
    botonesActivarMetodo()
}

const botonesEliminarMetodo=()=>{
    const botonesEliminar: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".configuracion__caja__metodos-eliminar")
    botonesEliminar.forEach(boton=>{
        boton.onclick=async ()=>{
            const metodoNombre = boton.parentElement!.querySelector('.configuracion__caja__metodos-nombre')!.textContent! // Obtiene el nombre del metodo que se quiere eliminar
            const respuesta = await solicitudEliminarMedioPago(metodoNombre) // Solicita la eliminacion del elemento
            if(respuesta!==0) { // El metodo se encuentra presente en registros de venta, por lo que se desactiva
                preguntar(`El metodo de pago esta esta presente en ${respuesta} registro/s de venta, por lo que se desactivo en vez de eliminarse`)
                const medio = metodosPago.find((metodo) => metodo.nombre === metodoNombre)!;
                medio.estado=false
            }else{ // Se elimina el metodo de pago
                const metodoIndex = metodosPago.findIndex((medio) => medio.nombre === metodoNombre)
                metodosPago.splice(metodoIndex,1)
            }
            
            // Aplica los cambios en toda la aplicacion
            cargarMetodosPago()
            cargarSeccionCaja()
            cargarBotonesVentaPublico()
        }
    })
}

const botonesActivarMetodo=()=>{
    const botonesActivar: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".configuracion__caja__metodos-activar")
    botonesActivar.forEach(boton=>{
        boton.onclick=async ()=>{
            const metodoNombre = boton.parentElement!.querySelector('.configuracion__caja__metodos-nombre')!.textContent! // Obtiene el nombre del metodo que se quiere activar
            const respuesta = await solicitudActivarMedioPago(metodoNombre) // Solicita la activacion del metodo
            if(respuesta!==0) return
            
            // Actualiza el metodo de pago en la aplicacion
            const medio = metodosPago.find((metodo) => metodo.nombre === metodoNombre)!;
            medio.estado=true

            // Aplica los cambios en toda la aplicacion
            cargarMetodosPago()
            cargarSeccionCaja()
            cargarBotonesVentaPublico()
        }
    })
}

const asignarBotonAgregarMetodo=()=>{
    /* Crea el boton para agregar metodos de pago */
    const contendorMetodos = document.getElementById('configuracion__caja__metodos')!
    const botonAgregarMetodo = document.getElementById('configuracion__caja__metodos-agregar')!
    
    botonAgregarMetodo.onclick=()=>{
        botonAgregarMetodo.classList.add('noActivo') // Desactiva el boton para agregar mas metodos de pago
        const nuevoMetodo = document.createElement('div')
        nuevoMetodo.className="configuracion__caja__metodos-fila"
        nuevoMetodo.innerHTML=`
        <input class="configuracion__caja__metodos-nombre inputRegistener2">
        <select class="configuracion__caja__metodos-tipo inputRegistener2">
            <option>Efectivo</option>
            <option>Bancario</option>
            <option>Digital</option>
        </select>
        <div class="configuracion__caja__metodos-textoError letra__enError"></div>
        `

        // Crea el boton para confirmar el nuevo metodo de pago
        const botonConfirmar = document.createElement('button')
        botonConfirmar.className="configuracion__caja__metodos-confirmar boton__activo botonRegistener3"
        botonConfirmar.innerHTML=`<i class="fa-solid fa-check"></i>`
        botonConfirmar.onclick=async ()=>{
            // Obtiene los contenedores
            const inputNombre = (botonConfirmar.parentElement!.querySelector(".configuracion__caja__metodos-nombre") as HTMLInputElement)!
            const selectTipo = (botonConfirmar.parentElement!.querySelector(".configuracion__caja__metodos-tipo") as HTMLSelectElement)!
            const textoError = botonConfirmar.parentElement!.querySelector('.letra__enError')!
            
            // Elimina los estados de error previos
            inputNombre.classList.remove('boton__enError')
            selectTipo.classList.remove('boton__enError')
            textoError.textContent=''

            // Realiza verificaciones
            if(!inputNombre.value){
                inputNombre.classList.add('boton__enError')
                textoError.textContent='El nombre para el metodo de pago es obligatorio'
                return
            }

            // Envia la solicitud 
            const respuesta = await solicitudCrearMetodoPago(inputNombre.value,selectTipo.value)
            
            // Se manejan los errores y le da aviso al usuario
            if(respuesta.errors.length>0){ 
                respuesta.errors.forEach(error=>{
                    if(error.path==="nombre"){
                        inputNombre.classList.add('boton__enError')
                        textoError.textContent=error.msg
                    }else if(error.path==="tipo"){
                        selectTipo.classList.add('boton__enError')
                        textoError.textContent=error.msg
                    }else{
                        mostrarMensaje("Hubo un error",true)
                    }
                })
                return
            }
            if(!respuesta.metodoPagoCreado) {
                mostrarMensaje("Hubo un error",true)
                return
            }

            // Aplica los cambios en toda la aplicacion
            metodosPago.push(respuesta.metodoPagoCreado)
            cargarMetodosPago()
            cargarSeccionCaja()
            cargarBotonesVentaPublico()
        }
        nuevoMetodo.appendChild(botonConfirmar)
        contendorMetodos.appendChild(nuevoMetodo)

    }
}

export const cambiarTema=(temaSeleccionado:string)=>{
    switch (temaSeleccionado) {
        case 'Escala de grises':
            
            document.documentElement.style.setProperty('--colorLetra', 'rgb(207, 207, 207)');
            document.documentElement.style.setProperty('--colorLetraTenue', 'rgba(207, 207, 207, 0.5)');
            document.documentElement.style.setProperty('--colorLetraError', 'rgba(255, 0, 0, 1)');
            
            document.documentElement.style.setProperty('--colorFondo', 'rgba(40, 40, 40)');
            document.documentElement.style.setProperty('--colorBarraLateral', 'rgba(50, 50, 50)');

            document.documentElement.style.setProperty('--colorFondoVentana', 'rgba(70, 70, 70)');
            document.documentElement.style.setProperty('--colorVentana', 'rgba(80, 80, 80)');

            document.documentElement.style.setProperty('--colorBotones', 'rgba(100, 100, 100)');

            break;
        case 'Azul oscuro':
            document.documentElement.style.setProperty('--colorLetra', 'rgb(207, 207, 207)');
            document.documentElement.style.setProperty('--colorLetraTenue', 'rgba(255 244 244 / 45%)');
            document.documentElement.style.setProperty('--colorLetraError', 'rgba(255, 0, 0, 1)');
            
            document.documentElement.style.setProperty('--colorFondo', '#2b1d4d');
            document.documentElement.style.setProperty('--colorBarraLateral', '#3B2869');

            document.documentElement.style.setProperty('--colorFondoVentana', '#453576');
            document.documentElement.style.setProperty('--colorVentana', '#1a60a0');

            document.documentElement.style.setProperty('--colorBotones', '#18548b');

            break;
        case 'Oscuro':
            document.documentElement.style.setProperty('--colorLetra', 'rgb(207, 207, 207)');
            document.documentElement.style.setProperty('--colorLetraTenue', 'rgba(207, 207, 207, 0.5)');
            document.documentElement.style.setProperty('--colorLetraError', 'rgba(255, 0, 0, 1)');
            
            document.documentElement.style.setProperty('--colorFondo', '#06141B');
            document.documentElement.style.setProperty('--colorBarraLateral', '#11212D');

            document.documentElement.style.setProperty('--colorFondoVentana', '#253745');
            document.documentElement.style.setProperty('--colorVentana', '#4A5C6A');

            document.documentElement.style.setProperty('--colorBotones', '#50666c');

            break;
        case 'Rojo chino':
            document.documentElement.style.setProperty('--colorLetra', 'rgb(207, 207, 207)');
            document.documentElement.style.setProperty('--colorLetraTenue', 'rgba(207, 207, 207, 0.5)');
            document.documentElement.style.setProperty('--colorLetraError', 'rgba(255, 255, 0, 1)');
            
            document.documentElement.style.setProperty('--colorFondo', '#230708');
            document.documentElement.style.setProperty('--colorBarraLateral', '#550f11');

            document.documentElement.style.setProperty('--colorFondoVentana', '#640508');
            document.documentElement.style.setProperty('--colorVentana', '#f42c1d');

            document.documentElement.style.setProperty('--colorBotones', '#AE1918');

            break;
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    /* Selecciona el tema de la aplicacion */
    const selectorTema = document.getElementById('configuracion__global__select-tema')! as HTMLSelectElement

    selectorTema.addEventListener('change',()=>{
        cambiarTema(selectorTema.value)
        localStorage.setItem('temaSeleccionado',selectorTema.value)
    })
})
