import { ObjectId } from "mongoose"

export interface usuario {
        _id:ObjectId
        nombre:string
        correo:string
        password:string
        listaDeseados:string[]
        rol:string
        img:string
        activo:boolean
        google:boolean
        telefono:string
        direccion:{
            codPostal:string,
            provincia:string,
            ciudad:string,
            calle:string,
            piso:string,
            observacion:string,
        }
        preferencias:{
            metodosPago:string[],
            modificacionesPago:string[]
        }
        createAT:Date
        updateAT:Date
        __v:number
        save: () => Promise<void>
    }
