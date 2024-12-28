import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import Usuario from '../models/usuario.js';

export const validarJWT = async(req: Request, res: Response,next:NextFunction)=>{

    const secretOrPrivateKey = process.env.SECRETORPRIVATEKEY as string 

    const token = req.header('tokenAcceso') // Obtiene el JWT de los headers de la solicitud

    if(!token){ // Si no se envia un token en la request:
        return res.status(401).json({
            errors:[{
                msg: 'No se encontro el token',
                path: "accesoToken"
            }]
        })
    }

    try {
        // Verifica que el token sea valido
        const { _id } = jwt.verify(token,secretOrPrivateKey) as { _id: string } // Si es valido devuelve el token desencriptado, del cual se extrae el _id
        
        const usuario = await Usuario.findById(_id); // Busca el usuario que posee con el id del token


        if(!usuario){ // Si no se encontro el usuario:
            return res.status(401).json({
                errors:[{
                    msg: 'El usuario no existe',
                    path: "accesoToken"
                }]
            })
        }

        if(!usuario.activo){ // Si el usuario no esta activo:
            return res.status(401).json({
                errors:[{
                    msg: 'El usuario no esta activo',
                    path: "accesoToken"
                }]
            })
        }

        req.body.usuario = usuario // Define el _id del usuario que esta realizando la solitud, en la request, para ser usado en los siguientes middlewares
        
        next() // Continúa con el siguiente middleware o controlador
    } catch (error) { // Si el token no es valido "verify" lanzara un error y se atrapa aqui
        return res.status(401).json({
            errors:[{
                msg: 'Token no valido',
                path: "accesoToken"
            }]
        })
    }
}