

import { convertirAInput } from "../helpers/convertirElemento.js"
import { cargarPaginadoRegistros } from "../helpers/paginadoRegistros.js"
import { eliminarRegistro, verRegistroVentas } from "../services/registroVentasAPI.js"
import { ventanaModificarVenta } from "./ventanasEmergentes/modificarVenta.js"
import { preguntar } from "./ventanasEmergentes/preguntar.js"

//TODO proximo
// Vendedor,Cliente,estado(completado,anulado),exportar a excel,imprimir recibo o factura,devolucion en efectivo

/* Inputs */
const fechaDesdeInput= document.getElementById('registroVentas__filtros__fechaDesde')! as HTMLInputElement
const fechaHastaInput= document.getElementById('registroVentas__filtros__fechaHasta')! as HTMLInputElement

const indiceObservacion=()=>{
    const indiceObservacion = document.getElementById('registroVentas__indiceTabla__observacion') as HTMLButtonElement|undefined
    if(indiceObservacion){
        indiceObservacion.onclick=()=> {
            const inputFinal = convertirAInput(indiceObservacion,'registroVentas__indiceTabla__observacion-input','registroVentas-buscaObservacion','text',false,cargarRegistrosVentaDOM)
            inputFinal.focus() // Le hace focus inmediatamente al input recien creado
        }
        if(sessionStorage.getItem('registroVentas-buscaObservacion')) convertirAInput(indiceObservacion,'registroVentas__indiceTabla__observacion-input','registroVentas-buscaObservacion','text',false,cargarRegistrosVentaDOM)
    }
}

const indiceID=()=>{
    const indiceID = document.getElementById('registroVentas__indiceTabla__ID') as HTMLButtonElement|undefined
    if(indiceID) {
        indiceID.onclick=()=> {
            const inputFinal = convertirAInput(indiceID,'registroVentas__indiceTabla__ID-input','registroVentas-IDVenta','text',false,cargarRegistrosVentaDOM)
            inputFinal.focus() // Le hace focus inmediatamente al input recien creado
        }
        if(sessionStorage.getItem('registroVentas-IDVenta')) convertirAInput(indiceID,'registroVentas__indiceTabla__ID-input','registroVentas-IDVenta','text',false,cargarRegistrosVentaDOM)
    }
}

const indiceEstado=()=>{
    const indiceEstado = document.getElementById('registroVentas__indiceTabla__estado')!
    const contenedorOpciones = document.getElementById('registroVentas__indiceTabla__estado__opciones')!
    const checkExitoso = document.getElementById('estado__opciones__exitoso')! as HTMLInputElement
    const checkModificado = document.getElementById('estado__opciones__modificado')! as HTMLInputElement
    const checkAnulado = document.getElementById('estado__opciones__anulado')! as HTMLInputElement

    let checkEstados = sessionStorage.getItem('registroVentas-estado')! || '123' // Los estados se almacenan en un arreglo donde un digito particular representa el estado activo de un check
    // 1: Exitoso
    // 2: Modificado
    // 3: Anulado

    // Refleja si estan activos o no en el checkbox
    checkExitoso.checked = checkEstados.includes('1')
    checkModificado.checked = checkEstados.includes('2')
    checkAnulado.checked = checkEstados.includes('3')

    // Alterna los estados cuando se les hace click
    checkExitoso.onclick=()=>{
        alternarEstado('1')
    
    }
    checkModificado.onclick=()=>{
        alternarEstado('2')
    
    }
    checkAnulado.onclick=()=>{
        alternarEstado('3')
    
    }
    
    indiceEstado.onclick=()=>{
        contenedorOpciones.classList.remove('noActivo')
    }
    document.addEventListener('click',(event)=>{
        const elementoClick = event.target as HTMLElement // Almacena el elemento al que se hizo click
        const esClickFuera = !indiceEstado.contains(elementoClick) // Verifica si el elemento al que se hizo click esta dentro del contenedor del indice de estado
        if(esClickFuera) contenedorOpciones.classList.add('noActivo') // Si se hizo click fuera del indice de estado entonces desactiva el contenedor
    })  
}

const alternarEstado=(estadoAlternar:string)=>{
    let checkEstados = sessionStorage.getItem('registroVentas-estado')! || '123'
    if(checkEstados.includes(estadoAlternar)) checkEstados=checkEstados.replace(estadoAlternar,'') // Si estaba activo lo desactiva
    else checkEstados=checkEstados+estadoAlternar // Si estaba desactivado lo activa
    sessionStorage.setItem('registroVentas-estado',checkEstados) // Guarda los cambios
    cargarRegistrosVentaDOM() // Actualiza los registros mostrados en el DOM

    // Cambia el numero de la cantidad de estados activos para mostrar en la busqueda
    const contenedorCantidadEstados = document.getElementById('registroVentas__indiceTabla__estado-cantidad')! // Contenedor del contador
    contenedorCantidadEstados.textContent=`(${checkEstados.length})` // Se refleja en el DOM la cantidad de estados activos en la busqueda
    contenedorCantidadEstados.className='' // Se quitan las clases previas
    if(checkEstados.length===0) contenedorCantidadEstados.classList.add('letra__enError') // Activa la clase de estado de error si la cantidad de estados activos en la busqueda es cero
}

const botonModificarVenta=()=>{
    const botonesModificarVenta = document.querySelectorAll('.registroVentas__botonModificar') as NodeListOf<HTMLButtonElement>
    botonesModificarVenta.forEach((boton)=>{
        boton.onclick=async()=>{
            const IDVenta = boton.parentElement!.firstElementChild!.textContent!
            ventanaModificarVenta(IDVenta)
        }
    })
}

const botoneliminarRegistro=()=>{
    const botonesAnularVenta = document.querySelectorAll(".registroVentas__botonAnular") as NodeListOf<HTMLButtonElement>
    botonesAnularVenta.forEach((boton)=>{
        boton.onclick=async()=>{
            const respuesta = await preguntar("¿Estas seguro que deseas anular el registro?")
            if(!respuesta) return
            const IDVenta = boton.parentElement!.firstElementChild!.textContent!
            await eliminarRegistro(IDVenta)
            cargarRegistrosVentaDOM() // Recarga la seccion para visualizar los cambios
        }
    })
}

const selectCantidadPaginas=()=>{
    const select = document.getElementById('registroVentas__filtros__cantidad')! as HTMLSelectElement
    const selectCantidad = sessionStorage.getItem('registroVentas-cantidadElementos')||'25'
    select.value = selectCantidad

    select.addEventListener('input',()=>{
        sessionStorage.setItem('registroVentas-cantidadElementos',select.value)
        cargarRegistrosVentaDOM()
    })
}

const inputFechas=()=>{


    // Coloca las fechas en los inputs
    const fechaHasta  = sessionStorage.getItem('registroVentas-fechaHasta') ? new Date(new Date().setDate(new Date(sessionStorage.getItem('registroVentas-fechaHasta') as string).getDate() - 1)).toISOString().slice(0, 10) // La fecha almacenada tiene un dia mas sumado, para asi mostrar los resultados de la fecha seleccionada inclusive, por lo tanto se le resta un dia
                                                                            : new Date().toISOString().slice(0, 10) // Si no hay una fecha seleccionada entonces se pone el dia de hoy
    const fechaDesde  = sessionStorage.getItem('registroVentas-fechaDesde') ? new Date(sessionStorage.getItem('registroVentas-fechaDesde') as string).toISOString().slice(0, 10) // Fecha inicial para mostrar los resultados
                                                                            : new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10); // Si no hay fecha inicial entonces pone la fecha de hace 7 dias

    // Asigna las fechas a los inputs
    fechaDesdeInput.value=fechaDesde;
    fechaHastaInput.value=fechaHasta;

    fechaDesdeInput.addEventListener('input',()=>{ 
        const fechaInput = new Date(fechaDesdeInput.value+'T00:00:00-03:00').toString().substring(0,15) // Se obtiene la fecha del input
        sessionStorage.setItem('registroVentas-fechaDesde',fechaInput ||'')
        cargarRegistrosVentaDOM()
    })

    fechaHastaInput.addEventListener('input',()=>{ 
        const fechaInput = new Date(new Date(fechaHastaInput.value+'T00:00:00-03:00').setDate(new Date(fechaHastaInput.value+'T00:00:00-03:00').getDate() + 1)).toString().substring(0,15); // Se obtiene la fecha del input y se le suma un dia para obtener los resultados del dia seleccionado
        sessionStorage.setItem('registroVentas-fechaHasta',fechaInput ||'') 
        cargarRegistrosVentaDOM()
    })
}

export const cargarRegistrosVentaDOM=async ()=>{

    /* Contenedores */
    const contenedorRegistros = document.getElementById('registroVentas__contenedorTabla')!
    const contenedorRegistroVenta = document.getElementById('registroVentas') as HTMLElement
    const contenedorPaginado = document.getElementById('registroVentas__indice') as HTMLElement

    /* Activa la seccion */
    contenedorRegistroVenta.classList.remove('noActivo')

    /* Parametros de busqueda */
    const desde = sessionStorage.getItem('registroVentas-desde')||undefined
    const cantidadElementos = sessionStorage.getItem('registroVentas-cantidadElementos')||'25'
    const IDVenta = sessionStorage.getItem('registroVentas-IDVenta')||undefined
    const metodo = sessionStorage.getItem('registroVentas-metodo')||undefined
    let estados = sessionStorage.getItem('registroVentas-estado')
    if(estados===undefined||estados===null) {
        sessionStorage.setItem('registroVentas-estado','123')
        estados='123'
    }
    estados = estados.replace('1','Exitoso,')
    estados = estados.replace('2','Modificado,')
    estados = estados.replace('3','Anulado,')

    const buscaObservacion = sessionStorage.getItem('registroVentas-buscaObservacion')||undefined
    const pagina = sessionStorage.getItem('registroVentas-pagina')||undefined
    const fechaDesde = sessionStorage.getItem('registroVentas-fechaDesde')||undefined
    const fechaHasta = sessionStorage.getItem('registroVentas-fechaHasta')||undefined

    /* Realiza la busqueda de los elementos en la base de datos */
    let respuesta = await verRegistroVentas(desde,cantidadElementos,pagina,IDVenta,metodo,estados,buscaObservacion,fechaDesde,fechaHasta)
    if(respuesta.registroVentas.length<1&&respuesta.registroVentasCantidad>0){
        // Si la pagina de la respuesta no tiene elementos entonces vuelve hacer la busqueda para la primer pagina
        respuesta = await verRegistroVentas(desde,cantidadElementos,'1',IDVenta,metodo,estados,buscaObservacion,fechaDesde,fechaHasta)
        sessionStorage.setItem('registroVentas-pagina','1')
    }

    // Vacia el contenedor 
    contenedorRegistros.innerHTML=``

    if(respuesta.registroVentasCantidad===0){ // Si no se encontraron elementos para mostrar entonces muestra un mensaje al usuario
        const contenedorMensaje = document.createElement('div')
        contenedorMensaje.id="registroVentas__mensajeSinElementos"
        contenedorMensaje.textContent=`No se encontro ningun elemento para los parametros de busqueda`
        contenedorRegistros.appendChild(contenedorMensaje)
        document.getElementById('registroVentas__indice')!.innerHTML='' // Vacia el contenedor de paginado
        return
    }

    
    // Agrega los registros al DOM
    const fragmento = document.createDocumentFragment()
    respuesta.registroVentas.forEach(registro=>{
        const fecha = new Date(registro.fechaVenta)
        const contenedorRegistro = document.createElement('div');
        contenedorRegistro.className="registroVentas__fila";
        contenedorRegistro.innerHTML=`
            <div>${registro._id}</div>
            <div>${fecha.toLocaleString('es-AR',{hour12: false})||''}</div>
            <div>$ ${registro.total.toLocaleString('es-AR')||''}</div>
            <div>${registro.metodo2?'Combinado':registro.metodo1||''}</div>
            <div>${registro.etiqueta||''}</div>
            <div class="${registro.estado==='Modificado'?'letra__enAdvertencia':(registro.estado==='Anulado'?'letra__enError':'')}">${registro.estado}</div>
            <div class="registroVentas__fila__observacion" title="${registro.observacion||''}">${registro.observacion||''}</div>
            <button class="botonRegistener1 registroVentas__botonModificar" ><i class="fa-solid fa-pencil" aria-hidden="true"></i></button>
            <button class="botonRegistener1 registroVentas__botonAnular " ${registro.estado==="Anulado"?'disabled':""}><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        `

        fragmento.appendChild(contenedorRegistro)
    })
    contenedorRegistros.appendChild(fragmento)


    cargarPaginadoRegistros(respuesta.paginasCantidad,contenedorPaginado,'registroVentas',cargarRegistrosVentaDOM);
    botonModificarVenta();
    botoneliminarRegistro();
    fechaDesdeInput.value = new Date(sessionStorage.getItem('registroVentas-fechaDesde') as string).toISOString().slice(0, 10); // Actualiza la fecha del input con la fecha almacena 

}


document.addEventListener('DOMContentLoaded',()=>{
    selectCantidadPaginas()
    inputFechas()
    indiceObservacion()
    indiceID()
    indiceEstado()
})
