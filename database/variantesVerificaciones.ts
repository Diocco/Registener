import { ObjectId } from "mongoose";
import Variante from "../src/models/variante.js";

// Verifica que el SKU sea unico 
export const SKUUnico = async(SKU:String,id?:string) =>{
    const existe = await Variante.findOne({SKU}) // Verifica si en la base de datos haya un objeto que tenga una SKU "parametro" con el mismo valor pasado como argumento en el body
    if(existe){ // Si el SKU es encontrado entonces:
        if(id){ // Si se envio como parametro un id entonces verifica si el id es el mismo que el del objecto encontrado
            if(existe._id.toString()!==id) throw new Error(`El SKU: ${SKU} ya esta registrado`);
        }else{
            throw new Error(`El SKU: ${SKU} ya esta registrado`);
        }

    };
}

export const varianteExiste=async(varianteId:string)=>{
    const existe = await Variante.findById(varianteId) // Verifica si en la base de datos haya un objeto que tenga una SKU "parametro" con el mismo valor pasado como argumento en el body
    if(!existe) throw new Error("Id de la variable invalido");
}