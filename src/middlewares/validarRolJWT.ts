import { NextFunction, Request, Response } from "express";
import { usuario } from "../models/interfaces/usuario";


// Verifica que el rol del usuario autenticado mediante JWT sea del rol o roles pasados como argumentos
export const validarRolJWT = (...roles:string[]) => { 
    return (req: Request, res: Response, next:NextFunction) =>{

        const usuario:usuario = req.body.usuario // Recupera el usuario del JWT

        if(!usuario){ // Si no se encontro ningun usuario entonces:
            return res.status(500).json({
                msg:'Se quiere validar el rol sin antes validar el token'
            })
        }

        const rolValido = roles.find(r =>  r===usuario.rol ) // Busca el rol del usuario en los roles pasados como argumentos

        if(!rolValido){ // Si no se encontro ninguno entonces:
            return res.status(401).json({
                msg:`${usuario.nombre} no tiene permisos de administrador`
            })
        }
        next()
    }
}
