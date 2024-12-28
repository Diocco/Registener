import { ObjectId } from "mongoose";
import { RegistroCajaI } from "../../../models/interfaces/registroCaja.js";
import { cargarPaginadoRegistros } from "../helpers/paginadoRegistros.js";
import { solicitudObtenerRegistrosCaja } from "../services/registroCajaAPI.js";
import { obtenerFechaActual } from "../helpers/formatearFecha.js";


/* Inputs */
const fechaDesdeInput= document.getElementById('registroCaja__filtros__fechaDesde')! as HTMLInputElement
const fechaHastaInput= document.getElementById('registroCaja__filtros__fechaHasta')! as HTMLInputElement


export const cargarRegistrosCajaDOM=async ()=>{

    /* Contenedores */
    const contenedorRegistros = document.getElementById('registroCaja__contenedorTabla')!
    const contenedorSeccionRegistroCaja = document.getElementById('registroCaja') as HTMLElement
    const contenedorPaginado = document.getElementById('registroCaja__indice') as HTMLElement

    /* Activa la seccion */
    contenedorSeccionRegistroCaja.classList.remove('noActivo')

    /* Parametros de busqueda */
    const desde = sessionStorage.getItem('registroCaja-desde')||undefined
    const cantidadElementos = sessionStorage.getItem('registroCaja-cantidadElementos')||'10'
    const pagina = sessionStorage.getItem('registroCaja-pagina')||undefined
    const fechaDesde = sessionStorage.getItem('registroCaja-fechaDesde')||undefined
    const fechaHasta = sessionStorage.getItem('registroCaja-fechaHasta')||undefined

    /* Realiza la busqueda de los elementos en la base de datos */
    let respuesta = await solicitudObtenerRegistrosCaja(desde,cantidadElementos,pagina,fechaDesde,fechaHasta)
    if(respuesta.registroCaja.length<1&&respuesta.registroCajaCantidad>0){
        // Si la pagina de la respuesta no tiene elementos entonces vuelve hacer la busqueda para la primer pagina
        respuesta = await solicitudObtenerRegistrosCaja(desde,cantidadElementos,'1',fechaDesde,fechaHasta)
        sessionStorage.setItem('registroCaja-pagina','1')
    }


    // Vacia el contenedor 
    contenedorRegistros.innerHTML=``

    if(respuesta.registroCajaCantidad===0){ // Si no se encontraron elementos para mostrar entonces muestra un mensaje al usuario
        const contenedorMensaje = document.createElement('div')
        contenedorMensaje.id="registroCaja__mensajeSinElementos"
        contenedorMensaje.textContent=`No se encontro ningun elemento para los parametros de busqueda`
        contenedorRegistros.appendChild(contenedorMensaje)
        document.getElementById('registroCaja__indice')!.innerHTML='' // Vacia el contenedor de paginado
        return
    }

    // Agrega los registros al DOM
    const fragmento = document.createDocumentFragment()
    respuesta.registroCaja.forEach(registro=>{

        // Calcula la diferencia total
        let diferenciaTotal = 0
        registro.mediosDePago.forEach(medio=>diferenciaTotal = diferenciaTotal + medio.saldoEsperado - medio.saldoFinal)

        const fecha = new Date(registro.fechaCierre)
        const contenedorRegistro = document.createElement('div');
        contenedorRegistro.className="registroCaja__fila contenedorRegistener3";
        contenedorRegistro.innerHTML=`
            <div>${fecha.toLocaleString('es-AR',{hour12: false})||''}</div>
            <div>${registro.usuarioCierre||''}</div>
            <div class="registroCaja__fila__diferencia">$ ${diferenciaTotal.toLocaleString('es-AR')||''}</div>
        `
        contenedorRegistro.onclick=()=>visualizarRegistro(registro)
        fragmento.appendChild(contenedorRegistro)
    })
    contenedorRegistros.appendChild(fragmento)


    cargarPaginadoRegistros(respuesta.paginasCantidad,contenedorPaginado,'registroCaja',cargarRegistrosCajaDOM);
    fechaDesdeInput.value = new Date(sessionStorage.getItem('registroCaja-fechaDesde') as string).toISOString().slice(0, 10); // Actualiza la fecha del input con la fecha almacena 

}

const selectCantidadPaginas=()=>{
    const select = document.getElementById('registroCaja__filtros__cantidad')! as HTMLSelectElement
    const selectCantidad = sessionStorage.getItem('registroCaja-cantidadElementos')||'10'
    select.value = selectCantidad

    select.addEventListener('input',()=>{
        sessionStorage.setItem('registroCaja-cantidadElementos',select.value)
        cargarRegistrosCajaDOM()
    })
}

const visualizarRegistro=(registro: RegistroCajaI)=>{
    
    const contenedorVisualizador = document.getElementById("registroCaja__registro")!
    
    document.getElementById('registroCaja__contenedorVisualizador-mensaje')!.classList.add('noActivo') // Desactiva el mensaje previo a la seleccion de un registro
    contenedorVisualizador.classList.remove('noActivo') // Activa el visualizador de registros

    // Coloca la informacion del registro
    document.getElementById('registroCaja__registro-fecha1')!.textContent = obtenerFechaActual(registro.fechaApertura)||'' // Fecha de apertura
    document.getElementById('registroCaja__registro-fecha2')!.textContent = obtenerFechaActual(registro.fechaCierre)||'' // Fecha de apertura
    document.getElementById('registroCaja__registro-vendedor1')!.textContent = registro.usuarioApertura // Usuario que abrio el arqueo
    document.getElementById('registroCaja__registro-vendedor2')!.textContent = registro.usuarioCierre // Usuario que cerro el arqueo

    // Coloca los metodos de pago

    // Selecciona el contenedor y lo vacia
    const tablaMetodosPago = document.getElementById('registroCaja__registro-metodosPago__tabla')!
    tablaMetodosPago.innerHTML=``

    // Verifica si hay metodos de pago para agregar
    if(registro.mediosDePago.length<1){
        tablaMetodosPago.innerHTML='<div> No se encontraron medios de pago</div>'
        return
    }

    // Agrega los metodos de pago
    const fragmento = document.createDocumentFragment()
    registro.mediosDePago.forEach(metodo=>{
        const metodoPagoDIV = document.createElement('div')
        metodoPagoDIV.className="registroCaja__registro-fila contenedorRegistener3"
        metodoPagoDIV.innerHTML=`
        <div class="registroCaja__registro-nombre">${metodo.medio}</div>
        <div>$ ${(metodo.saldoInicial).toLocaleString('es-AR')}</div>
        <div>$ ${(metodo.saldoFinal).toLocaleString('es-AR')}</div>
        <div>$ ${(metodo.saldoEsperado).toLocaleString('es-AR')}</div>
        <div>$ ${(metodo.saldoFinal-metodo.saldoEsperado).toLocaleString('es-AR')}</div>
        `
        fragmento.appendChild(metodoPagoDIV)
    })
    tablaMetodosPago.appendChild(fragmento)
}

const inputFechas=()=>{


    // Coloca las fechas en los inputs
    const fechaHasta  = sessionStorage.getItem('registroCaja-fechaHasta') ? new Date(new Date().setDate(new Date(sessionStorage.getItem('registroCaja-fechaHasta') as string).getDate() - 1)).toISOString().slice(0, 10) // La fecha almacenada tiene un dia mas sumado, para asi mostrar los resultados de la fecha seleccionada inclusive, por lo tanto se le resta un dia
                                                                            : new Date().toISOString().slice(0, 10) // Si no hay una fecha seleccionada entonces se pone el dia de hoy
    const fechaDesde  = sessionStorage.getItem('registroCaja-fechaDesde') ? new Date(sessionStorage.getItem('registroCaja-fechaDesde') as string).toISOString().slice(0, 10) // Fecha inicial para mostrar los resultados
                                                                            : new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10); // Si no hay fecha inicial entonces pone la fecha de hace 7 dias

    // Asigna las fechas a los inputs
    fechaDesdeInput.value=fechaDesde;
    fechaHastaInput.value=fechaHasta;

    fechaDesdeInput.addEventListener('input',()=>{ 
        const fechaInput = new Date(fechaDesdeInput.value+'T00:00:00-03:00').toString().substring(0,15) // Se obtiene la fecha del input
        sessionStorage.setItem('registroCaja-fechaDesde',fechaInput ||'')
        cargarRegistrosCajaDOM()
    })

    fechaHastaInput.addEventListener('input',()=>{ 
        const fechaInput = new Date(new Date(fechaHastaInput.value+'T00:00:00-03:00').setDate(new Date(fechaHastaInput.value+'T00:00:00-03:00').getDate() + 1)).toString().substring(0,15); // Se obtiene la fecha del input y se le suma un dia para obtener los resultados del dia seleccionado
        sessionStorage.setItem('registroCaja-fechaHasta',fechaInput ||'') 
        cargarRegistrosCajaDOM()
    })
}

document.addEventListener('DOMContentLoaded',()=>{
    selectCantidadPaginas()
    inputFechas()
})
