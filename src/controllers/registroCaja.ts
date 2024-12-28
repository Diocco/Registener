import { Request,Response } from "express"
import { usuario } from "../models/interfaces/usuario.js"
import CajaRegistro from "../models/registroCaja.js"
import { error } from "../interfaces/error.js"
import mongoose from "mongoose"
import { RegistroCajaI } from "../models/interfaces/registroCaja.js"

export const registrarCierreCaja = async(req: Request, res: Response) =>{
    // Desestructura la informacion del body para utilizar solo la informacion requerida
    // Previamente se verifico la existencia de los elementos obligatorios y el formato correcto de la totalidad de los elementos
    const { 
        fechaApertura,
        fechaCierre,
        usuarioApertura,
        usuarioCierre,
        mediosDePago,
        observacion
    } = req.body

    const usuario:usuario = req.body.usuario

    // Estructura la informacion para enviarla
    const data = {
        fechaApertura,
        fechaCierre,
        usuarioApertura,
        usuarioCierre,
        mediosDePago,
        observacion
    }
    try{

        const registroCaja = new CajaRegistro( data ) // Crea una nuevo registro de cierre de caja
        await registroCaja.save() // La guarda en la base de datos
        res.json(registroCaja)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al crear el registro del cierre de caja",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

export const verRegistroCaja = async(req: Request, res: Response)=>{

    // Si se envian queryparams entonces se buscan todos los productos filtrados por los parametros recibidos
    const desde:number = Math.abs(Number(req.query.desde)) || 0;  // Valor por defecto 0 si no se pasa el parámetro o es invalido
    const cantidadElementos:number = Math.abs(Number(req.query.cantidadElementos)) || 10;  // Valor por defecto 20 para mostrar los elementos en varias paginas
    const fechaDesde = req.query.fechaDesde as string||'0';  
    const fechaHasta = req.query.fechaHasta as string|| new Date().toString();  
    const pagina:number = Math.abs(Number(req.query.pagina)) || 1;  // Valor que indica la pagina de los resultados


    try{
        let filtros: any = {
            $and: [
                { fechaCierre: { $gte: new Date(fechaDesde), $lte: new Date(fechaHasta)  } },  // Rango de precios
            ]
        };


        // Crea un array de promesas que son independientes entre ellas para procesarlas en paralelo
        const [registroCaja, registroCajaCantidad]:[RegistroCajaI[],number] = await Promise.all([ // Una vez que se cumplen todas se devuelve un array con sus resultados
            CajaRegistro.find(filtros)  // Busca a todos los productos en la base de datos que cumplen la condiciones
                .skip(desde+((pagina-1)*cantidadElementos)).sort({fechaCierre:-1}).limit(cantidadElementos),
            CajaRegistro.countDocuments(filtros) // Devuelve la cantidad de objetos que hay que cumplen con la condiciones
        ]);

        // Indica la cantidad de paginas que se necesitan para mostrar todos los resultados
        const paginasCantidad:number = Math.ceil(registroCajaCantidad/cantidadElementos); 

        res.status(200).json({
            registroCaja,
            registroCajaCantidad,
            paginasCantidad
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver los registros de arqueo de caja",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}