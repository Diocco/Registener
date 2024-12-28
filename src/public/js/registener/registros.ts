import { cargarRegistrosCajaDOM } from "./registroCaja.js"
import { cargarRegistrosVentaDOM } from "./registroVentas.js"

export const cargarSeccionRegistros=()=>{
    const contenedorRegistros = document.getElementById('registros') as HTMLElement
    const contenedorRegistroCaja = document.getElementById('registroCaja') as HTMLElement
    const botonVentas = document.getElementById('registros__botonVentas') as HTMLButtonElement  
    const botonArqueos = document.getElementById('registros__botonArqueos') as HTMLButtonElement

    botonVentas.onclick=()=>{
        contenedorRegistros.classList.add('noActivo')
        cargarRegistrosVentaDOM()
    }
    botonArqueos.onclick=()=>{
        contenedorRegistros.classList.add('noActivo')
        cargarRegistrosCajaDOM()
    }
}