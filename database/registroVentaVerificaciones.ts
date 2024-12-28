import { RegistroVentaI } from "../src/models/interfaces/registroVentas.js";
import VentaRegistro from "../src/models/registroVenta.js";

// Verifica que el producto exista
export const registroVentaExiste = async(registroVentaID:string) =>{
    let registroVenta:RegistroVentaI|null  // Inicializa una variable que almacena el registro de la base de datos
    try {
        if(!registroVentaID) throw new Error(`EL id del registro es obligatorio`);
        registroVenta = await VentaRegistro.findById(registroVentaID) // Verifica si en la base de datos haya un objeto que tenga el id pasado como argumento
    } catch (error) {
        throw new Error(`Id no valido`);
    }
    if(!registroVenta){ // Si el registro no existe entonces:
        throw new Error(`El registro con id: ${registroVentaID}, no existe`);
    }else if(registroVenta.estado==="Anulado"){ // Si el registro existe pero esta anulado entonces:
        throw new Error(`El registro con id: ${registroVentaID}, esta anulado`);
    }
}