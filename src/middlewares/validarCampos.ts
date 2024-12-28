import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validarCampos = (req: Request, res: Response,next:NextFunction)=>{
    // Revisa las validaciones
    const errores = validationResult(req); // Si las validaciones lanzaron errores se van a guardar aca
    if(!errores.isEmpty()){ // Si "errores" NO esta vacio entonces:
        return res.status(400).json(errores) // Devuelve un mensaje de error
    }
    next() // Indica que si no dio errores entonces que sigue con los siguientes middlewares
}