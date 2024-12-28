import mongoose from 'mongoose';

const rolSchema = new mongoose.Schema({
    rol:{ //Se puede estructurar de esta forma para que sea mas legible
        type: String,
        required: [true, "El rol es obligatorio"] //Mensaje de error personalizado
    }
})

const Role = mongoose.model('Role', rolSchema);

export default Role;