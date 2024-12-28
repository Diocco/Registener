import mongoose, { Model } from 'mongoose';
import { MetodoPagoI } from './interfaces/metodosPago';

const metodoPagoSchema = new mongoose.Schema<MetodoPagoI>({ // Crea el esquema para la categoria
    nombre: { type: String, required: true },
    tipo: { 
        type: String, 
        enum: ["Digital", "Bancario", "Efectivo"], 
        required: true 
    },
    estado: { type: Boolean, default: true },
})

const MetodoPago:Model<MetodoPagoI> = mongoose.model<MetodoPagoI>('metodoPago', metodoPagoSchema);

export default MetodoPago;