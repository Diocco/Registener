
import jwt from 'jsonwebtoken'

export const generarJWT = (_id:string) =>{
    return new Promise<string>((resolve, reject) => {
        
        const payload = { _id } // Define que informacion del usuario va a llevar el JWT
        const secretOrPrivateKey = process.env.SECRETORPRIVATEKEY as string // Clave para la encriptacion

        jwt.sign(payload, secretOrPrivateKey, {
            expiresIn: '72h' // Define cuando expira el token
        }, ( err, token ) => { // Callback

            if( err ){ // Si hay un error...
                console.log(err)
                reject('No se pudo generar el token')
            }else{ // Si no hay errores devuelve el token
                resolve(token as string)
            }
        }
    )
})
}

