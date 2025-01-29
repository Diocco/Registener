import mongoose from "mongoose"
import { CategoriaI } from "./categorias.js"
import { variante } from "./variante.js"

export interface producto {
    _id:mongoose.Schema.Types.ObjectId,
    nombre:string,
    marca:string,
    modelo:string,
    estado:boolean,
    usuario:mongoose.Schema.Types.ObjectId, 
    categoria:mongoose.Schema.Types.ObjectId|CategoriaI,
    variantes: mongoose.Schema.Types.ObjectId[]|variante[],
    descripcion: string
    precio:number,
    precioViejo:number,
    especificaciones:[EspecificacionI]
    disponible:boolean,
    tags:[string],
    imagenes: string[],
    save: () => Promise<void>
    }

export interface EspecificacionI {
    nombre:string,
    descripcion:string
}