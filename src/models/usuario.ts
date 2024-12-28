import mongoose from 'mongoose';
import { usuario } from './interfaces/usuario';

const usuarioSchema = new mongoose.Schema<usuario>({
    nombre:{ //Se puede estructurar de esta forma para que sea mas legible
        type: String,
        required: [true, "El nombre es obligatorio"], //Mensaje de error personalizado
        trim: true 
    },
    correo: { //Correo del usuario
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true
    },
    password:{ 
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    listaDeseados:{
        type: [String],
        ref: 'Producto'
    },
    rol: { 
        type: String, 
        required: true,
        enum: ['admin', 'usuario'], 
        default: 'usuario' },
    img: { // Imagen de perfil
        type: String,
    },
    activo: { // Si se encuentra activo
        type: Boolean, 
        default: true 
    },
    google:{ // Indica si los datos del usuario se obtuvieron mediante google
        type: Boolean,
        default: false
    },
    telefono: { // Telefono del usuario
        type: String,
    },
    direccion:{
        codPostal:{
            type:String,
        },
        provincia:{
            type:String,
        },
        ciudad:{
            type:String,
        },
        calle:{
            type:String,
        },
        piso:{
            type:String,
        },
        observacion:{
            type:String,
        }
    },
    preferencias:{
        metodosPago:{
            type:[String],
            default:[]
        },
        modificacionesPago:{
            type:[String],
            default:[]
        }
    }
}, { timestamps: true });

// Cuando se llama a "usuarioSchema" dentro de un "toJSON" se ejecuta la siguiente funcion:
usuarioSchema.methods.toJSON = function() {
    // Convierte el documento Mongoose a un objeto de JavaScript.
    const { __v, password,...usuario } = this.toObject();

    
    // Retorna el objeto 'usuario' sin las propiedades 'password' y '__v'.
    return usuario;
}


const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;