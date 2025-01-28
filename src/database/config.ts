import 'dotenv/config';
import mongoose from "mongoose";

const conexionDB = async() => {
    // Manejo de errores por si falla la conexion
    try {
        //Conecta la base de datos usando la variable global como argumento
        await mongoose.connect("mongodb+srv://diegoiocco13:%40Fpfjbzx13@embike.s5mdo.mongodb.net/alfredo") ;
        console.log("Base de datos conectada con exito");
    } catch (error) {
        console.log("No se pudo conectar con la base de datos");
        throw new Error("No se pudo conectar con la base de datos");
    }
}



export {conexionDB}