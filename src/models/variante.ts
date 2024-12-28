import mongoose, { Model } from 'mongoose';
import { variante } from './interfaces/variante';

const varianteSchema = new mongoose.Schema<variante>({
    producto:{ // Se almacena el usuario que creo la categoria
        type: mongoose.Schema.Types.ObjectId, // Se especifica que se va a usar un schema como tipo
        ref: 'Producto', // Se especifica el Schema particular que se va a almacenar
        required: [true, "El producto es obligatorio"] //Mensaje de error personalizado
    },
    color: { // Se puede estructurar de esta forma para que sea mas legible
        type: String,
    },
    talle: { // Se puede estructurar de esta forma para que sea mas legible
        type: String,
    },
    SKU: { // Se puede estructurar de esta forma para que sea mas legible
        type: String,
        unique:true,
        required: [true, "El SKU es obligatorio"] //Mensaje de error personalizado
    },
    stock: { // Se puede estructurar de esta forma para que sea mas legible
        type: Number,
    },
    esFavorito:{
        type:Boolean,
    }
})

    const Variante:Model<variante> = mongoose.model<variante>('Variante', varianteSchema);

export default Variante;
