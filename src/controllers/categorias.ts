import { Request, Response } from 'express';
import Categoria from '../models/categoria.js';
import { CategoriaI } from '../models/interfaces/categorias.js';
import { usuario } from '../models/interfaces/usuario.js';
import { error } from '../interfaces/error.js';



// Devuelve todas las categorias
const verCategorias = async(req: Request, res: Response)=>{
    const nombres:string[]|null = req.query.nombres as string[] || null;
    const condicion = {estado:true}; // Condicion/es que debe cumplir la busqueda

    try {
        // Crea un array de promesas que no son independientes entre ellas para procesarlas en paralelo
        let [categorias, categoriasCantidad]:[ CategoriaI[] | string[] , number] = await Promise.all([ // Una vez que se cumplen todas se devuelve un array con sus resultados
            Categoria.find(condicion),  // Busca a todos los categorias en la base de datos que cumplen la condicion
            Categoria.countDocuments(condicion) // Devuelve la cantidad de objetos que hay que cumplen con la condicion
        ])



        if(nombres){ // Si nombres es "true" entonces devuelve la solicitud solo un array con los nombres de las categorias
            categorias = categorias.map(categoria => categoria.nombre)
        }

        res.status(200).json({
            categoriasCantidad,
            categorias
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al obtener las categorias",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Devuelve la categoria con el id pasado como parametro
const verCategoriaID = async(req: Request, res: Response)=>{
    const { id } = req.params 
    const condicion = {estado:true}; // Condicion/es que debe cumplir la busqueda de la categoria

    try {
        const categoria = await Categoria.findById(id,condicion).populate('usuario')
        res.status(200).json(categoria)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error buscar la categoria",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Crea una nueva categoria
const crearCategoria = async(req: Request, res: Response)=>{
    const nombre:string = req.body.nombre
    const usuario:usuario = req.body.usuario

    try{
        // Verifica que el nombre sea unico
        const categoriaDB = await Categoria.findOne({ nombre })

        if(categoriaDB){ // Si la categoria se encontro en la base de datos:
            return res.status(400).json({
                errors:[{
                    msg: "La categoria ya existe",
                    path: "nombre"
                }]
            })
        }

        // Si paso todas las verificaciones entonces:
        const data={
            nombre,
            usuario
        };


        const categoria = new Categoria( data ) // Crea una nueva categoria
        await categoria.save() // La guarda en la base de datos
        
        res.json(categoria)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al crear la categoria",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Actualiza una categoria con el id pasado como parametro
const actualizarCategoria = async(req: Request, res: Response)=>{
    const { id } = req.params; 
    const nombre:string = req.body.nombre; // Extrae el parametro que sea modificable
    try{
        // Busca por id en la base de datos que actualiza las propiedades que esten en el segundo parametro. { new: true } devuelve el documento actualizado
        const categoriaActualizada = await Categoria.findByIdAndUpdate( id,{ nombre }, { new: true }); 

        res.status(200).json({ //Devuelve un mensaje y el usuario agregado a la base de datos
            msg: "Categoria actualizada en la base de datos",
            categoriaActualizada
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al actualizar la categoria",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Elimina una categoria con el id pasado como parametro
const eliminarCategoria = async(req: Request, res: Response) =>{
    const {id} = req.params; // Desestructura el id

    try{
        // Busca la categoria con ese id y cambia su estado de actividad
        const categoriaEliminada = await Categoria.findByIdAndUpdate( id , {estado: false}, { new: true }); 
        const usuarioAutenticado:usuario = req.body.usuario
        res.status(200).json({
            categoriaEliminada,
            usuarioAutenticado
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al eliminar la categoria",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}




export {
    verCategorias,
    verCategoriaID,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
}