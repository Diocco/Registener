import mongoose, { Model } from "mongoose";
import { RegistroVentaI } from './interfaces/registroVentas.js';

const ventaSchema = new mongoose.Schema<RegistroVentaI>({
    lugarVenta:{ 
        type: String,
    },
    fechaVenta: {
        type: Date,
        default:Date.now(),
        required: [true, "La fecha de la venta es obligatoria"]
    },
    total: {
        type: Number,
        required: [true, "El total de la venta es obligatorio"]
    },
    metodo1:{ 
        type: String,
        required: [true, "El metodo de pago es obligatorio"]
    },
    metodo2:{ 
        type: String,
    },
    pago1:{ 
        type: Number,
    },
    pago2:{ 
        type: Number,
    },
    descuentoNombre:{ 
        type: String,
    },
    descuento:{ 
        type: Number,
    },
    promocion:{
        type: mongoose.Schema.Types.ObjectId,
    },
    observacion: { 
        type: String
    },
    etiqueta: { 
        type: String
    },
    cliente:{
        type: mongoose.Schema.Types.ObjectId,
    },
    carrito:[{
        SKU:{
            type: String,
        },
        cantidad:{
            type: Number,
        },
        precio:{
            type: Number,
        },
        nombre:{
            type: String,
        },
    }],
    vendedor: { 
        type: String
    },
    estado: { 
        type: String,
        default:'Completado'
    },
    modificaciones:[{
        fecha:{
            type: Date
        },
        usuarioNombre:{
            type: String
        },
        modificacion:{
            type: String
        },
    }],
});

const VentaRegistro:Model<RegistroVentaI> = mongoose.model<RegistroVentaI>('VentaRegistro', ventaSchema);

export default VentaRegistro;