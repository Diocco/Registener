import { MediosDePagoI } from "../src/models/interfaces/registroCaja.js";

export const mediosDePagoValido=(mediosDePago:MediosDePagoI[])=>{
    mediosDePago.forEach((m)=>{
        if((typeof m.medio !== 'string')) throw new Error("Error al validar los medios de pago")
        if(isNaN(Number(m.saldoInicial))) throw new Error("Error al validar los medios de pago")
        if(isNaN(Number(m.saldoFinal))) throw new Error("Error al validar los medios de pago")
        if(isNaN(Number(m.saldoEsperado))) throw new Error("Error al validar los medios de pago")
    })

    return true
}