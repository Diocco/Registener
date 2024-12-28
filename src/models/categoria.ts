import mongoose, { Model } from 'mongoose';
import { CategoriaI } from './interfaces/categorias';

const categoriaSchema = new mongoose.Schema<CategoriaI>({ // Crea el esquema para la categoria
    nombre:{ //Se puede estructurar de esta forma para que sea mas legible
        type: String,
        required: [true, "El nombre es obligatorio"] //Mensaje de error personalizado
    },
    estado:{ 
        type: Boolean,
        default:true,
        required: true //Mensaje de error personalizado
    },
    usuario:{ // Se almacena el usuario que creo la categoria
        type: mongoose.Schema.Types.ObjectId, // Se especifica que se va a usar un schema como tipo
        ref: 'Usuario' // Se especifica el Schema particular que se va a almacenar
    }
})

const Categoria:Model<CategoriaI> = mongoose.model<CategoriaI>('Categoria', categoriaSchema);

export default Categoria;