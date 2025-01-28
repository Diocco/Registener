import { Request, Response } from 'express';
import Usuario from '../models/usuario.js';
import bcryptjs from 'bcryptjs';
import { generarJWT } from '../helpers/generarJWT.js';
import { usuario } from '../models/interfaces/usuario.js';
import { error } from '../interfaces/error.js';




const login = async(req: Request, res: Response) => {
    const { correo, password } = req.body;
    try {
        const usuario:usuario = (await Usuario.findOne({correo}))!; // Previamente se verifico que el usuario existe
        // Validar contraseña
        const contraseñaValida = bcryptjs.compareSync(password,usuario.password) // Verifica que la contraseña sea correcta
        if(!contraseñaValida){ // Si la contraseña no es correcta:
            return res.status(400).json({
                errors:[{
                    msg: "Contraseña incorrecta",
                    path: "password"
                }]
            })
        }

        // Generar JWT 
        const token = await generarJWT( usuario._id.toString() )

        res.status(200).json({
            msg: "Login Realizado con exito",
            token,
            usuario,
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al autenticar el usuario",
            path: "Servidor",
            value: (error as Error).message
        }]
        return res.status(500).json({ message: 'Hubo un error en el servidor', error});
    }
    

    
};

export {
    login
}