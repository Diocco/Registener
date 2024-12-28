import { error } from "../interfaces/error";
import { Request, Response } from 'express';
import MetodoPago from "../models/metodosPago.js";
import { usuario } from "../models/interfaces/usuario.js";
import { MetodoPagoI } from "../models/interfaces/metodosPago.js";
import VentaRegistro from "../models/registroVenta.js";

export const verMetodosPago = async(req: Request, res: Response) =>{

    try{
        const metodosPago = await MetodoPago.find()  // Busca todos los metodos de pago

        res.status(200).json({metodosPago})

    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver los productos",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

export const crearMetodoPago = async(req: Request, res: Response) =>{
    // Desestructura la informacion del body para utilizar solo la informacion requerida
    // Previamente se verifico la existencia de los elementos obligatorios y el formato correcto de la totalidad de los elementos
    const { nombre,tipo } = req.body

    const usuario:usuario = req.body.usuario
    
    let data:MetodoPagoI={ // Estructura la informacion obligatoria para realizar la solicitud
        nombre,
        tipo,
        estado:true
    }

    try{

        const metodoPago = new MetodoPago( data ) // Crea una nuevo registro de venta
        await metodoPago.save() // La guarda en la base de datos
        res.json(metodoPago)

    } catch (error) {
        const errors:error[]=[{
            msg: "Error al crear el metodo de pago",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

export const eliminarMetodoPago = async(req: Request, res: Response) =>{

    const {metodoNombre} = req.params  // Obtiene el nombre del metodo de pago que se quiere eliminar
    try {
        // Busca si hay registros de ventas con ese metodo de pago
        const registrosCantidad = await VentaRegistro.countDocuments({$and: [ { metodo1:metodoNombre }]}) // Devuelve la cantidad de objetos que hay que cumplen con la condiciones

        // Si hay almenos un registro entonces desactiva el metodo de pago, con opcion de volverlo a activar
        if(registrosCantidad>0){
            await MetodoPago.updateOne({nombre:metodoNombre},{estado:false})
            res.status(200).json(registrosCantidad)
        }else{ // Si el metodo no tiene registros asociados entonces lo elimina por completo
            await MetodoPago.deleteOne({nombre:metodoNombre})
            res.status(200).json(0)
        }

    } catch (error) {
        const errors:error[]=[{
            msg: "Error al eliminar el metodo de pago",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }

}

export const activarMetodoPago = async(req: Request, res: Response) =>{

    const {metodoNombre} = req.params  // Obtiene el nombre del metodo de pago que se quiere eliminar

    try {
        // Busca y activa el metodo de pago
        await MetodoPago.findOneAndUpdate({nombre:metodoNombre},{estado:true})
        res.status(200).json(0)

    } catch (error) {
        const errors:error[]=[{
            msg: "Error al activar el metodo de pago",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}