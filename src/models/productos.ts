import mongoose, { Model } from 'mongoose';
import { producto } from './interfaces/producto';

const productoSchema = new mongoose.Schema<producto>({
    nombre:{ 
        type: String,
        required: [true, "El nombre es obligatorio"]
    },
    marca: {
        type: String,
        required: [true, "La marca es obligatoria"]
    },
    modelo: {
        type: String,
        required: [true, "El modelo es obligatorio"]
    },
    estado:{ 
        type: Boolean,
        default: true,
        required: true 
    },
    usuario:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    },
    categoria:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria'
    },
    variantes: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variante' 
    }],
    descripcion:{
        type: String
    },
    precio:{
        type: Number,
        default: 0
    },
    precioViejo:{
        type: Number,
        default: 0
    },
    especificaciones: [{
        nombre:{
            type:String
        },
        descripcion:{
            type:String
        }
    }],
    disponible:{
        type: Boolean,
        default: true,
        required: true
    },
    tags:{
        type: [String]
    },
    imagenes: {
        type: [String]
    }
});

const Producto:Model<producto> = mongoose.model<producto>('Producto', productoSchema);

export default Producto;