import { MetodoPagoI } from "../../../models/interfaces/metodosPago.js"
import { MediosDePagoI } from "../../../models/interfaces/registroCaja.js"
import { usuario } from "../../../models/interfaces/usuario.js"
import { usuarioVerificado } from "../global.js"
import { obtenerFechaActual } from "../helpers/formatearFecha.js"
import { mostrarMensaje } from "../helpers/mostrarMensaje.js"
import { solicitudObtenerMetodosPago } from "../services/metodosPagoAPI.js"
import { solicitudRegistrarCaja } from "../services/registroCajaAPI.js"
import { registrarVenta, solicitudObtenerIngresos } from "../services/registroVentasAPI.js"
import { metodosPago, usuarioInformacion } from "./index.js"
import { cargarRegistrosVentaDOM } from "./registroVentas.js"

// Botones
const botonAbrirCaja = document.getElementById('seccionCaja__abrirCaja') as HTMLButtonElement
const botonCerrarCaja = document.getElementById('seccionCaja__cerrarCaja') as HTMLButtonElement
const botonVerMovimientos = document.getElementById('seccionCaja__movimientosCaja') as HTMLButtonElement
const botonConfirmarCambio = document.getElementById('seleccionCaja__cambiosCaja__button') as HTMLButtonElement

// Inputs
let inputsSaldoInicial:NodeListOf<HTMLInputElement> 
let inputsSaldoFinal:NodeListOf<HTMLInputElement> 

// Contenedores
let contenedoresNombreMetodo:NodeListOf<HTMLInputElement> 
const contenedorSeccionCaja = document.getElementById('seleccionCaja')!
const contenedorUltimoInicio = document.getElementById('seccionCaja__ultimoInicio')!
const contenedorUltimoCierre = document.getElementById('seccionCaja__ultimoCierre')!

// Variables
let fechaHasta:Date|undefined
let fechaDesde:Date|undefined
let esCajaActiva:boolean


export const cargarSeccionCaja=()=>{
    cargarMetodosPago()
    cargarEstadoCaja()
    if(esCajaActiva) abrirCaja(true)
    actualizarIngresos() // Actualiza los valores de los montos esperados en los metodos de pago
    cargarBotonConfirmarCambio()
    botonAbrirCaja.onclick=()=>abrirCaja()
    botonCerrarCaja.onclick=()=>cerrarCaja()
    botonVerMovimientos.onclick=()=>cargarBotonVerMovimientos()
}

const cargarEstadoCaja=()=>{    
    esCajaActiva = localStorage.getItem('esCajaActiva')==='true'?true:false

    // Coloca la hora de la ultima apertura de caja
    if(localStorage.getItem('ultimoInicioCaja')) {
        fechaDesde = new Date(localStorage.getItem('ultimoInicioCaja')!)
        contenedorUltimoInicio.textContent = "Última apertura: "+obtenerFechaActual(fechaDesde)
        contenedorUltimoInicio.classList.remove('noActivo')
    }else{
        fechaDesde = undefined
        esCajaActiva=false
    }

    // Coloca la hora del ultimo cierre de caja
    if(localStorage.getItem('ultimoCierreCaja')) {
        fechaHasta = new Date(localStorage.getItem('ultimoCierreCaja')!)
        contenedorUltimoCierre.textContent = "Último cierre: "+obtenerFechaActual(fechaHasta)
        contenedorUltimoCierre.classList.remove('noActivo')
    }else{
        fechaHasta = undefined
    }
}

const cargarBotonConfirmarCambio=()=>{
    const selectEtiqueta = document.getElementById('seleccionCaja__cambiosCaja__etiqueta')! as HTMLInputElement
    const selectMetodoPago = document.getElementById('seleccionCaja__cambiosCaja__metodo')! as HTMLInputElement
    const inputMonto = document.getElementById('seleccionCaja__cambiosCaja__monto')! as HTMLInputElement
    const textObservacion = document.getElementById('seleccionCaja__cambiosCaja__observacion')! as HTMLTextAreaElement


    // Carga las opciones de metodos de pago
    let opcionesHTML:string = `<option value="" disabled selected>Selecciona una opción</option>`
    metodosPago.forEach(metodo=>{
        if(!metodo.estado) return // Verifica que sea un metodo activo
        opcionesHTML=opcionesHTML+`<option>${metodo.nombre}</option>`
    })
    selectMetodoPago.innerHTML=opcionesHTML;

    // Si se hace click en algun elemento, se quita el estado de error del mismo
    [selectEtiqueta,selectMetodoPago,inputMonto,textObservacion].forEach(input=>input.onclick=()=>input.classList.remove("boton__enError"))

    // Se hace click en el boton confirmar
    botonConfirmarCambio.onclick=()=>{
        // Elimina los contenedor con error
        contenedorSeccionCaja.querySelectorAll(".boton__enError").forEach(cont=>cont.classList.remove("boton__enError"))

        // Verifica que exista una valor en la descripcion
        let esError = false
        if(textObservacion.value===''){
            textObservacion.classList.add("boton__enError")
            esError = true
        }
        if(selectEtiqueta.value===''){
            selectEtiqueta.classList.add("boton__enError")
            esError = true
        }
        if(selectMetodoPago.value===''){
            selectMetodoPago.classList.add("boton__enError")
            esError = true
        }
        if(inputMonto.value===''){
            inputMonto.classList.add("boton__enError")
            esError = true
        }
        if(esError) return
        
        // Registra los cambios
        registrarVenta(Number(inputMonto.value),selectMetodoPago.value,'Exitoso',selectEtiqueta.value,undefined,undefined,undefined,'Cambios',undefined,undefined,textObservacion.value)
    
        // Refleja los cambios
        actualizarIngresos()

        // Limpia la ventana de cambios de caja
        textObservacion.value=''
        selectEtiqueta.value=''
        selectMetodoPago.value=''
        inputMonto.value=""
    }

}

const cargarBotonVerMovimientos=()=>{

    contenedorSeccionCaja.classList.add('noActivo') // Oculta la seccion de la caja

    /* Define los parametros de busqueda */
    sessionStorage.setItem('registroVentas-fechaDesde',fechaDesde!.toString()) // Define la fecha inicial como la fecha donde se abrio la caja
    sessionStorage.setItem('registroVentas-IDVenta','') // Elimina cualquier busqueda por ID
    sessionStorage.setItem('registroVentas-metodo','') // Elimina cualquier busqueda por metodo
    sessionStorage.setItem('registroVentas-buscaObservacion','') // Elimina cualquier busqueda por observacion
    sessionStorage.setItem('registroVentas-fechaHasta',''); // Elimina cualquier busqueda por fecha limite, dejando la fecha limite la hora actual

    cargarRegistrosVentaDOM() // Carga la seccion de registros
}

const cargarMetodosPago=async ()=>{
    // Selecciona el contenedor y lo vacia
    const tablaArqueoCaja = document.getElementById('seleccionCaja__tablaSaldos')!
    tablaArqueoCaja.innerHTML=``

    // Verifica si hay metodos de pago para agregar
    if(metodosPago.length<1){
        tablaArqueoCaja.innerHTML='<div> No se encontraron medios de pago</div>'
        return
    }

    // Agrega los metodos de pago
    const fragmento = document.createDocumentFragment()
    metodosPago.forEach((metodo)=>{
        if(!metodo.estado) return // Si el metodo no tiene estado "true" entonces pasa al siguiente
        const metodoPagoDIV = document.createElement('div')
        metodoPagoDIV.className="seleccionCaja__tablaSaldos__fila"
        metodoPagoDIV.innerHTML=`
        <div class="seleccionCaja__tablaSaldos__metodo">${metodo.nombre}</div>
        <input class="inputRegistener1 seleccionCaja__tablaSaldos__input-inicial"  autocomplete="off" type="number" placeholder="$ 0" value="${localStorage.getItem(`saldoInicialMetodo-${metodo.nombre}`)||''}">
        <input class="inputRegistener1 seleccionCaja__tablaSaldos__input-final nodisponible" autocomplete="off"  type="number"  placeholder="$ 0" disabled>
        <div class="seleccionCaja__tablaSaldos__input-esperado" >$ 0</div>
        <div class="seleccionCaja__tablaSaldos__input-diferencia">$ 0</div>
        `
        fragmento.appendChild(metodoPagoDIV)
    })
    tablaArqueoCaja.appendChild(fragmento)

    // Obtiene y almacena los nodos de los medios de pago para ser utilizado en las demas funciones
    definirInputsSaldoFinal()
    inputsSaldoInicial = document.querySelectorAll(".seleccionCaja__tablaSaldos__input-inicial") as NodeListOf<HTMLInputElement>
    contenedoresNombreMetodo = document.querySelectorAll(".seleccionCaja__tablaSaldos__metodo") as NodeListOf<HTMLInputElement>
}

const obtenerSaldoInicialDOM=()=>{
    inputsSaldoInicial.forEach(input=> {
        const metodoNombre = input.parentElement!.querySelector(".seleccionCaja__tablaSaldos__metodo")!.textContent!
        localStorage.setItem(`saldoInicialMetodo-${metodoNombre}`,input.value.toString())
    })
}

const reiniciarVariables=()=>{
    // Reinicia los valores iniciales de cada medio de pago
    const contenedoresMediosPago = document.querySelectorAll(".seleccionCaja__tablaSaldos__fila")
    contenedoresMediosPago.forEach(cont=>{
        const nombre = cont.querySelector('.seleccionCaja__tablaSaldos__metodo')!.textContent!
        localStorage.setItem(`saldoInicialMetodo-${nombre}`,'')
    });

    // Reinicia los inputs de saldo inicial
    (document.querySelectorAll(".seleccionCaja__tablaSaldos__input-inicial") as NodeListOf<HTMLInputElement>).forEach(input=>input.value='');
    // Reinicia los inputs de saldo final
    (document.querySelectorAll(".seleccionCaja__tablaSaldos__input-final") as NodeListOf<HTMLInputElement>).forEach(input=>input.value='');
    // Reinicia los contenedores de saldo esperado
    document.querySelectorAll(".seleccionCaja__tablaSaldos__input-esperado").forEach(cont=>cont.textContent='$ 0');
    // Reinicia los contenedores de diferencia de saldo
    document.querySelectorAll(".seleccionCaja__tablaSaldos__input-diferencia").forEach(cont=>cont.textContent='$ 0');
}


const obtenerMediosPago=()=>{
    const contenedoresMediosPago = document.querySelectorAll(".seleccionCaja__tablaSaldos__fila")
    let enError = false
    let mediosDePago:[MediosDePagoI]=[{ // Inicia la variable con valores por default
        medio: "",
        saldoInicial: 0,
        saldoFinal: 0,
        saldoEsperado: 0
    }]
    let i=0
    contenedoresMediosPago.forEach(cont=>{
        if(cont.id==="seleccionCaja__tablaSaldos__encabezado") return
        const medio = cont.querySelector(".seleccionCaja__tablaSaldos__metodo")!.textContent!;
        const saldoInicial = Number(localStorage.getItem(`saldoInicialMetodo-${medio}`)!)
        const saldoFinal =  Number((cont.querySelector(".seleccionCaja__tablaSaldos__input-final")! as HTMLInputElement).value)
        const saldoEsperado =  Number(cont.querySelector(".seleccionCaja__tablaSaldos__input-esperado")!.textContent!.replace(/[^0-9]/g, ''))

        // Verifica que todas las variables existan
        if(!medio || isNaN(saldoInicial) || isNaN(saldoInicial) || isNaN(saldoInicial) ) enError = true

        // Le da la estructura correcta y almacena la informacion
        const medioPago:MediosDePagoI={
            medio,
            saldoInicial,
            saldoFinal,
            saldoEsperado
        }
        mediosDePago[i]=medioPago
        i++
    })

    if(enError) {
        mostrarMensaje("Error al guardar el registro de caja",true)
        return undefined
    }

    return mediosDePago
    
}

export const actualizarIngresos=async ()=>{

    if(!esCajaActiva) return // Si la caja no se encuentra activa no hace nada

    if(!fechaDesde) {
        mostrarMensaje("No se puede obtener los ingresos",true)
        return
    } 
    const ingresos = await solicitudObtenerIngresos(fechaDesde)

    // Vacia todos los contenedores
    const contenedoresMontoEsperado = document.querySelectorAll('.seleccionCaja__tablaSaldos__input-esperado')
    contenedoresMontoEsperado.forEach(cont=>cont.textContent=`$ 0`)

    if(!ingresos) return // Si no hay datos termina la ejecucion


    contenedoresNombreMetodo.forEach(contenedorNombreMetodo => {
        const contenedorMontoEsperado = contenedorNombreMetodo.parentElement!.querySelector('.seleccionCaja__tablaSaldos__input-esperado')!
        const contenedorMontoDiferencia = contenedorNombreMetodo.parentElement!.querySelector('.seleccionCaja__tablaSaldos__input-diferencia')!
        const inputMontoFinal = contenedorNombreMetodo.parentElement!.querySelector('.seleccionCaja__tablaSaldos__input-final')! as HTMLInputElement

        // Actualiza el monto esperado
        if(contenedorNombreMetodo.parentElement!.id==="seleccionCaja__tablaSaldos__encabezado") return // Verifica que no sea el encabezado

        const montoInicial = Number(localStorage.getItem(`saldoInicialMetodo-${contenedorNombreMetodo.textContent}`)) // Obtiene el monto inicial del metodo
        const montoFinal = Number(inputMontoFinal.value)||0

        let ingreso = ingresos.find(i => i.metodo === contenedorNombreMetodo.textContent) // Obtiene el ingreso del metodo de pago que se esta evaluando
        if (!ingreso) ingreso={metodo:'',monto:0} // Si no hay ingresos define uno por defecto con valor 0
        else contenedorMontoEsperado.textContent = `$ ${(montoInicial+ingreso.monto).toLocaleString('es-AR')}`

        // Actualiza el monto de diferencia entre el saldo final y el esperado

        contenedorMontoDiferencia.textContent = `$ ${(ingreso.monto-montoFinal+montoInicial).toLocaleString('es-AR')}`
        if(montoInicial+ingreso.monto-montoFinal!==0 ) contenedorMontoDiferencia.classList.add('letra__enError')
        else contenedorMontoDiferencia.classList.remove('letra__enError')
    });

}

const definirInputsSaldoFinal=()=>{
    inputsSaldoFinal = document.querySelectorAll(".seleccionCaja__tablaSaldos__input-final") as NodeListOf<HTMLInputElement>
    inputsSaldoFinal.forEach(input=>input.addEventListener('input',()=>actualizarIngresos())) // Cada vez que se modifica su contenido vuelve a actualizar el monto de diferencia
}

const abrirCaja=(soloReflejar:boolean=false)=>{
    /*** Parametros ***/
    if(localStorage.getItem('ultimoInicioCaja')) fechaDesde = new Date(localStorage.getItem('ultimoInicioCaja')!)

    if(!soloReflejar){ // Si solo se quiere reflejar de forma visual que la caja esta activa no realiza cambios en los parametros
        localStorage.setItem('esCajaActiva','true')
        fechaDesde = new Date()
        localStorage.setItem('ultimoInicioCaja',fechaDesde.toString())
        esCajaActiva = true


        // Almacena los valores iniciales de los metodos de pago
        obtenerSaldoInicialDOM()
    }

    /*** HTML ***/
    // Activa los inputs para ingresar el saldo final
    const inputsSaldoFinal = document.querySelectorAll(".seleccionCaja__tablaSaldos__input-final") as NodeListOf<HTMLInputElement>
    inputsSaldoFinal.forEach(input=>{
        input.disabled = false
        input.classList.remove('nodisponible')
    })

    // Desactiva los inputs para ingresar el saldo inicial
    inputsSaldoInicial.forEach(input=>{
        input.disabled = true
        input.classList.add('nodisponible')
    })

    // Desactiva el boton de abrir caja
    botonAbrirCaja.disabled = true
    botonAbrirCaja.classList.add('nodisponible')

    // Activa el boton de cerrar caja    
    botonCerrarCaja.disabled = false
    botonCerrarCaja.classList.remove('nodisponible')

    // Activa el boton de movimientos de caja
    const botonMovimientosCaja = document.getElementById('seccionCaja__movimientosCaja') as HTMLButtonElement
    botonMovimientosCaja.disabled = false
    botonMovimientosCaja.classList.remove('nodisponible')

    // Cambia el estado visual de la caja
    const textoEstado = document.getElementById('seccionCaja__estado-text')!
    textoEstado.textContent = 'Activo'
    textoEstado.className='letra__activo'

    // Activa el boton para confirmar un cambio de caja
    const botonCambioCaja = document.getElementById('seleccionCaja__cambiosCaja__button')! as HTMLButtonElement
    botonCambioCaja.disabled = false
    botonCambioCaja.classList.remove('nodisponible')

    // Define la hora actual en el contenedor de ultimo inicio de caja
    if(fechaDesde) {
        contenedorUltimoInicio.textContent = `Último inicio: ${obtenerFechaActual(fechaDesde)}`
        contenedorUltimoInicio.classList.remove('noActivo')
    }
    
}

const cerrarCaja=()=>{

    /*** Parametros ***/
    localStorage.setItem('esCajaActiva','false')
    fechaHasta = new Date()
    localStorage.setItem('ultimoCierreCaja',fechaHasta.toString())
    esCajaActiva = false

    // Desactiva los inputs para ingresar el saldo final
    const inputsSaldoFinal = document.querySelectorAll(".seleccionCaja__tablaSaldos__input-final") as NodeListOf<HTMLInputElement>
    inputsSaldoFinal.forEach(input=>{
        input.disabled = true
        input.classList.add('nodisponible')
    })

    // Activa los inputs para ingresar el saldo inicial
    const inputsSaldoInicial = document.querySelectorAll(".seleccionCaja__tablaSaldos__input-inicial") as NodeListOf<HTMLInputElement>
    inputsSaldoInicial.forEach(input=>{
        input.disabled = false
        input.classList.remove('nodisponible')
    })

    // Activa el boton de abrir caja
    botonAbrirCaja.disabled = false
    botonAbrirCaja.classList.remove('nodisponible')

    // Desactiva el boton de cerrar caja    
    botonCerrarCaja.disabled = true
    botonCerrarCaja.classList.add('nodisponible')

    // Desactiva el boton de movimientos de caja
    const botonMovimientosCaja = document.getElementById('seccionCaja__movimientosCaja') as HTMLButtonElement
    botonMovimientosCaja.disabled = true
    botonMovimientosCaja.classList.add('nodisponible')

    // Cambia el estado visual de la caja
    const textoEstado = document.getElementById('seccionCaja__estado-text')!
    textoEstado.textContent = 'Inactivo'
    textoEstado.className='letra__enError'

    // Desactiva el boton para confirmar un cambio de caja
    const botonCambioCaja = document.getElementById('seleccionCaja__cambiosCaja__button')! as HTMLButtonElement
    botonCambioCaja.disabled = true
    botonCambioCaja.classList.add('nodisponible')

    // Define la hora actual en el contenedor de ultimo cierre de caja
    contenedorUltimoCierre.textContent = `Ultimo cierre: ${obtenerFechaActual()}`
    contenedorUltimoCierre.classList.remove('noActivo')

    // Vacia todos los contenedores
    const contenedoresMontoEsperado = document.querySelectorAll('.seleccionCaja__tablaSaldos__input-esperado')
    contenedoresMontoEsperado.forEach(cont=>cont.textContent=`$ 0`)

    const mediosDePago = obtenerMediosPago()
    if(mediosDePago) solicitudRegistrarCaja(fechaDesde!,fechaHasta!,"","",mediosDePago)
    reiniciarVariables()
}