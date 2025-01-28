import mongoose from "mongoose"

export interface RegistroCajaI {
    _id?:mongoose.Schema.Types.ObjectId,
    fechaApertura:Date,
    fechaCierre:Date,
    usuarioApertura:string,
    usuarioCierre:string,
    mediosDePago:[MediosDePagoI],
    observacion:string,
    usuario:mongoose.Schema.Types.ObjectId, 
}

export interface MediosDePagoI {
    medio:string,
    saldoInicial:number,
    saldoFinal:number,
    saldoEsperado:number
}