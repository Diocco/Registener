import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs'; // Encriptar contraseña
import pkg from 'bcryptjs'; 
const { hashSync } = pkg; // Destructura las funciones que necesitas


import Usuario from '../models/usuario.js';
import { generarJWT } from '../../helpers/generarJWT.js';
import Producto from '../models/productos.js';
import fileUpload from 'express-fileupload';

// Directorio
import path from 'path';
import { fileURLToPath } from 'url'
import { usuario } from '../models/interfaces/usuario.js';
import { error } from '../interfaces/error.js';
const __filename = fileURLToPath(import.meta.url); // Obtiene el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual


const agregarUsuario = async(req: Request, res: Response) => {

    //Desestructura la informacion entrante para usar solo lo que se requiera
    const {nombre,password,correo,google} = req.body;
    const rol='usuario';
    try{
        // Crea una nueva entrada con el modelo "Usuario"
        const usuario = new Usuario( {nombre,password,correo,rol,google} ); // A la entrada le agrega la informacion que viene en el body

        // Encriptar contraseña
        const salt = bcryptjs.genSaltSync() // Genera un "salt" para indicar el nivel de encriptacion
        usuario.password = hashSync(password, salt) // Genera un hash relacionado a la contraseña del usuario

        await usuario.save(); // Guarda el modelo en la base de datos

        // Generar JWT 
        const token = await generarJWT( usuario!.id )

        res.status(201).json({ //Devuelve un mensaje y el usuario agregado a la base de datos
            msg: "Usuario guardado en la base de datos",
            token,
            usuario
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al agregar el usuario",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
};


const modificarDeseado = async(req: Request, res: Response) =>{
    // Agrega un producto a la lista de productos deseados, y si ya existe entonces lo elimina de la lista
    // Recibe el id del usuario que se va a modificar la lista, se toma el id del el JWT
    const usuarioVerificado:usuario = req.body.usuario; 

    // Se toma el ObjetID del producto que se quiere agregar o eliminar
    const nuevoProductoDeseado:string = req.params.idProducto ;

    try {
        // Se busca al usuario en la base de datos
        const usuario = (await Usuario.findById(usuarioVerificado._id))!;
        
        // Se busca el indice del producto deseado dentro de la lista de productos deseados del usuario
        const indice = usuario.listaDeseados.indexOf(nuevoProductoDeseado)
        // Si existe el indice entonces quiere decir que el producto ya existe en la lista de deseados
        if(indice!==-1) usuario.listaDeseados.splice(indice,1) // Lo elimina de la lista
        else usuario.listaDeseados.push(nuevoProductoDeseado) // Si no existe el indice lo agrega a la lista

        // Guarda los cambios en la base de datos
        usuario.save()
        return res.status(200).json('Producto alternado de la lista de productos deseados')
    } catch (error) {
        const errors:error[]=[{
            msg: 'Error al alternar producto en la lista de productos deseados',
            path: 'Servidor',
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }


    

}

const verDeseados = async(req: Request, res: Response) =>{
    // Devuelve la lista de productos deseados
    const productoCompleto = req.query.productoCompleto // Almacena el valor, si existe se devuelven los productos completos y no solo sus id

    // Recibe el id del usuario de la lista de deseados, se toma el id del el JWT
    const usuarioVerificado:usuario = req.body.usuario; 

    try{
        // Se busca al usuario en la base de datos
        const usuario = (await Usuario.findById(usuarioVerificado._id))!;
        
        
        if(!productoCompleto){// Devuelve solo los id de lista de productos deseados
            res.json(usuario.listaDeseados);
        }else{// Devuelve la lista de productos deseados junto a toda su informacion
            let productos=[]
        
            for (const indice in usuario.listaDeseados) {
                const id = usuario.listaDeseados[indice]
                try{ // Busca el producto
                    const producto = await Producto.findById(id)
                    if(producto){
                        // Si el producto existe lo agrega
                        productos.push(producto)
                    }
                } // Si hay algun problema con un producto lo saltea
                catch{}
            }

            res.status(200).json(productos)
        }
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver la lista de productos deseados por el usuario",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

const actualizarUsuario = async(req: Request, res: Response) =>{
    const usuario:usuario = req.body.usuario; 
    const { nombre,
            correo, 
            password, 
            telefono ,
            codPostal,
            provincia,
            ciudad,
            calle,
            piso,
            observacion,
            metodosPago,
            modificacionesPago
        } = req.body // Desestructura las propiedades modificables
    const  imgPura  = (req.files?req.files.img:undefined) as fileUpload.UploadedFile// Obtiene la imagen 
    let img:string|undefined // Se inicia la variable que va a contener el path de la foto de perfil del usuario
    
    const direccion = {
        codPostal,
        provincia,
        ciudad,
        calle,
        piso,
        observacion
    }

    let data = {
        nombre,
        correo,
        password,
        telefono,
        img,
        direccion,
        preferencias:{
            metodosPago,
            modificacionesPago
        }
    }

    try{
        if(imgPura){ // Si se envia una foto de perfil del usuario entonces la sube al servidor
            try {
                data.img = await subirFotoPerfil(imgPura,usuario._id.toString()) 
            } catch (errors) {
                if ((errors as any).path==='Servidor'){
                    return res.status(500).json({errors})
                }
                return res.status(400).json({errors})
            }
        }


        if(password){ // Si se mando una contraseña:
            // Encriptar contraseña
            const salt = bcryptjs.genSaltSync() // Genera un "salt" para indicar el nivel de encriptacion
            data.password = hashSync(password, salt) // Genera un hash relacionado a la contraseña del usuario y la agrega al resto de propiedades
        }

        // Busca por id en la base de datos que actualiza las propiedades que esten en "resto". { new: true } devuelve el documento actualizado
        const usuarioActualizado = await Usuario.findByIdAndUpdate( usuario._id ,  data , { new: true }); 
        res.status(200).json({ //Devuelve un mensaje y el usuario agregado a la base de datos
            msg: "Usuario actualizado en la base de datos",
            usuarioActualizado,
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al actualizar el usuario",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

const subirFotoPerfil = async(img:fileUpload.UploadedFile,idUsuario:string) =>{
    // Recibe la foto de perfil del usuario y su id, la sube al servidor y devuelve el path de la imagen


    // Verifica la extension del archivo
    return new Promise<string>((resolve, reject) => {
        const nombreArchivoDividido = img.name.split('.')
        const extension = nombreArchivoDividido[nombreArchivoDividido.length - 1]
        const extensionesPermitidas = [`jpg`,`png`,`jpeg`,'webp','gif']
    
        if(!extensionesPermitidas.includes(extension)){
            reject([{
                    msg: `Extension no permitida, las extensiones permitidas son: ${extensionesPermitidas}`,
                    path: "archivo"
                }])
        }
        if(img.size > 5 * 1024 * 1024){
            reject([{
                    msg: `El archivo no debe superar los 5MB`,
                    path: "archivo"
                }])
        }
    
        // Define un nuevo nombre para el archivo
        const nombreArchivo=idUsuario+'.'+extension
    
        // Ruta donde se va a colocar el archivo
        const uploadPath = path.join(__dirname,'../public/img/fotosPerfil',nombreArchivo )

        // Mueve el archivo a la ruta definida
        img.mv(uploadPath,(err)=>{
            if (err){
                reject([{
                        msg: `Error al guardar el archivo`,
                        path: "Servidor"
                    }])
            }
        })
    
        resolve(nombreArchivo)
    })
    

}

const verUsuarios = async(req: Request, res: Response) =>{

    const desde:number = Math.abs(Number(req.query.desde)) || 0;  // Valor por defecto 0 si no se pasa el parámetro o es invalido
    const cantidad:number = Math.abs(Number(req.query.cantidad)) || 10;  // Valor por defecto 10 si no se pasa el parámetro o es invalido
    const condicion = {activo:true}; // Condicion que debe cumplir la busqueda de usuarios

    try{
        // Crea un array de promesas que no son independientes entre ellas para procesarlas en paralelo
        const [usuarios, usuariosCantidad] = await Promise.all([ // Una vez que se cumplen todas se devuelve un array con sus resultados
            Usuario.find(condicion)  // Busca a todos los usuarios en la base de datos que cumplen la condicion
                .skip(desde).limit(cantidad),
            Usuario.countDocuments(condicion) // Devuelve la cantidad de objetos que hay que cumplen con la condicion
        ])

        // Indica la cantidad de paginas que se necesitan para mostrar todos los resultados
        const paginasCantidad = Math.ceil(usuariosCantidad/cantidad); 

        res.status(200).json({
            usuariosCantidad,
            paginasCantidad,
            usuarios
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver los usuarios",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

const verUsuarioToken = async(req: Request, res: Response) =>{

    const usuarioVerificado:usuario = req.body.usuario!

    res.status(200).json({
        usuarioVerificado
    })
}

const eliminarUsuario = async(req: Request, res: Response) =>{

    const {id} = req.params; // Desestructura el id

    try{
        // Busca el usuario con ese id y cambia su estado de actividad
        const usuario = await Usuario.findByIdAndUpdate( id , {activo: false}, { new: true }); 
        const usuarioAutenticado:usuario = req.body.usuario
        res.status(200).json({
            usuario,
            usuarioAutenticado
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al eliminar el usuario",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}




export {
    agregarUsuario,
    actualizarUsuario,
    verUsuarios,
    eliminarUsuario,
    verUsuarioToken,
    modificarDeseado,
    verDeseados,
    subirFotoPerfil
}