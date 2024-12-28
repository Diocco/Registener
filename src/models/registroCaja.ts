import mongoose, { Model } from "mongoose";
import { RegistroCajaI } from "./interfaces/registroCaja.js";

const cajaSchema = new mongoose.Schema<RegistroCajaI>({
    fechaApertura:{ 
        type: Date,
        required: [true, "La fecha de la apertura de caja es obligatoria"]
    },
    fechaCierre: {
        type: Date,
        default:Date.now(),
        required: [true, "La fecha del cierre de caja es obligatorio"]
    },
    usuarioApertura: {
        type: String,
    },
    usuarioCierre:{ 
        type: String,
    },
    mediosDePago:[{
        medio:{
            type: String, 
            ref: 'metodoPago' 
        },
        saldoInicial:{
            type: Number,
        },
        saldoFinal:{
            type: Number,
        },
        saldoEsperado:{
            type: Number,
        },
    }],
    observacion: { 
        type: String
    },
});


const CajaRegistro:Model<RegistroCajaI> = mongoose.model<RegistroCajaI>('CajaRegistro', cajaSchema);

export default CajaRegistro;