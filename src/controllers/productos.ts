import { Request, Response } from 'express';
import Producto from '../models/productos.js';
import Categoria from '../models/categoria.js';
import mongoose from 'mongoose';
import { EspecificacionI, producto } from '../models/interfaces/producto.js';
import { usuario } from '../models/interfaces/usuario.js';
import { CategoriaI } from '../models/interfaces/categorias.js';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';

// Directorio
import path from 'path';
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url); // Obtiene el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual
import fs from 'fs'
import { error } from '../interfaces/error.js';

// Devuelve todas las productos
const verProductos = async(req: Request, res: Response)=>{

    // Si se envian queryparams entonces se buscan todos los productos filtrados por los parametros recibidos
    const desde:number = Math.abs(Number(req.query.desde)) || 0;  // Valor por defecto 0 si no se pasa el parámetro o es invalido
    const cantidadElementos:number = Math.abs(Number(req.query.cantidadElementos)) || 10;  // Valor por defecto 10 si no se pasa el parámetro o es invalido
    const pagina:number = Math.abs(Number(req.query.pagina)) || 1;  // Valor que indica la pagina de los resultados
    const precioMin:number = Math.abs(Number(req.query.precioMin)) || 0 // Precio minimo del producto
    const precioMax:number = Math.abs(Number(req.query.precioMax)) || 1000000000 // Precio maximo del producto
    const palabraBuscada:string = req.query.palabraBuscada as string || ''; // Palabra buscada por el usuario
    const categoriasNombresCadena:string = req.query.categorias as string || ''; // Categorias especificadas por el usuario en formato de cadena con separador por coma Ej:(categ1,categ2,categ3,)
    const disponible:boolean | undefined = (req.query.disponible)?false:true; // Indica si busca productos solo disponibles al publico, por defecto es true a menos que se envie un parametro
    const esVariantesCompleta:boolean = (req.query.variantes)?true:false; // Indica si se desea obtener la informacion de las variantes del producto
    const categoriasNombre:string | undefined = (req.query.categoriasNombre)?'categoria':undefined; // Indica si se desea obtener la informacion de las categorias del producto
    const SKUBuscado:string = req.query.SKUBuscado as string || ''; // SKU buscado por el usuario

    // Define la variable que se utiliza para la busqueda de variantes
    let poblarVariante:any=''
    if(esVariantesCompleta||SKUBuscado){
        poblarVariante='variantes'
        if(SKUBuscado) poblarVariante={
        path: 'variantes',
        match: { SKU:new RegExp(SKUBuscado, 'i') }
        }
    }

    try{
        // Se obtiene la forma de ordenar los resultados
        let ordenar: { [key: string]: number } = {}; // Inicia la variable vacia
        if(req.query.ordenar){ // Verifica si se envio la variable
            if (req.query.ordenar === 'precioMax') { 
                ordenar = { precio: -1 }; // Ordena por precio descendente
            } else if (req.query.ordenar === 'precioMin') {
                ordenar = { precio: 1 }; // Ordena por precio ascendente
            }
        }



        const categoriasNombreArreglo:string[] = categoriasNombresCadena.split(',').filter(Boolean) // Convierte la cadena en un arreglo

        // Busca las categorías por sus nombres
        let categoriasCompletas
        if(categoriasNombreArreglo[0]){ // Si se pasa como argumento las categorias especificas:
            categoriasCompletas = await Categoria.find({ nombre: {$in: categoriasNombreArreglo}});
        }else{ // Si no se busco ninguna categoria en particular entonces busca todas las categorias validas
            categoriasCompletas = await Categoria.find();
        }

        // Extrae los ObjectId de las categorías encontradas
        const categoriasIds: mongoose.Schema.Types.ObjectId[] = categoriasCompletas.map(categoria => categoria._id);


        // Definir la expresión regular para buscar productos cuyo nombre, descripción, etc., contenga la palabra buscada
        const palabraBuscadaRegExp = new RegExp(palabraBuscada, 'i');

        let filtros: any = {
            // Los filtros opcionales donde el valor buscado puede estar en varias propiedades
            $or: [
                { nombre: palabraBuscadaRegExp },
                { marca: palabraBuscadaRegExp },
                { modelo: palabraBuscadaRegExp },
                { descripcion: palabraBuscadaRegExp },
                { tags: { $in: [palabraBuscadaRegExp] } }  // Aquí el uso de $in, pero asegurándonos que tags es un array
            ],
            $and: [
                { estado: true },  // El producto no tiene que estar eliminado
                { precio: { $gte: precioMin, $lte: precioMax } },  // Rango de precios
                { categoria: { $in: categoriasIds } }  // Las categorías deben ser parte de las seleccionadas
            ]
        };

        if(disponible) filtros.$and[0].disponible = disponible // Si se tiene que realizar la busqueda de productos que esten disponibles entonces agrega el aparametro al filtro


        // Crea un array de promesas que no son independientes entre ellas para procesarlas en paralelo
        const [productos, productosCantidad]:[producto[],number] = await Promise.all([ // Una vez que se cumplen todas se devuelve un array con sus resultados
            Producto.find(filtros)  // Busca a todos los productos en la base de datos que cumplen la condicion
                .skip(desde+((pagina-1)*cantidadElementos)).sort(ordenar as any).limit(cantidadElementos).populate(poblarVariante).populate(categoriasNombre!),
            Producto.countDocuments(filtros) // Devuelve la cantidad de objetos que hay que cumplen con la condicion
        ])


        // Indica la cantidad de paginas que se necesitan para mostrar todos los resultados
        const paginasCantidad:number = Math.ceil(productosCantidad/cantidadElementos); 

        res.status(200).json({
            categoriasCompletas,
            productosCantidad,
            paginasCantidad,
            productos
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver los productos",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Devuelve la producto con el id pasado como parametro
const verProductoID = async(req: Request, res: Response)=>{
    const { id } = req.params
    try{
        const producto = await Producto.findById(id).populate('categoria')

        res.status(200).json(producto)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver el producto",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Crea una nueva producto
const crearProducto = async(req: Request, res: Response)=>{
    const { nombre, // Desestructura la informacion del body para utilizar solo la informacion requerida
        marca,
        modelo,
        categoria,
        descripcion,
        precio,
        precioViejo,
        disponible,
        tags
    } = req.body

    const usuario:usuario = req.body.usuario
    
    const data={
        nombre,
        marca,
        modelo,
        usuario,
        categoria,
        descripcion,
        precio,
        precioViejo,
        disponible,
        tags
    }
    try{
        const producto = new Producto( data ) // Crea una nueva producto
        await producto.save() // La guarda en la base de datos
        
        res.json(producto)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al crear el producto",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Actualiza una producto con el id pasado como parametro
const actualizarProducto = async(req: Request, res: Response)=>{

    const { id } = req.params;  // ID del producto
    const usuario:usuario = req.body.usuario
    let { nombre, // Desestructura la informacion del body para utilizar solo la informacion requerida
            marca,
            modelo,
            categoria,
            descripcion,
            precio,
            precioViejo,
            especificacionesJSON,
            disponible,
            tags,
            URLImagenVieja
        }:{
            nombre:string,
            marca:string,
            modelo:string,
            categoria:string,
            descripcion:string,
            precio:number,
            precioViejo:number,
            especificacionesJSON:string,
            disponible:boolean,
            tags:string[],
            URLImagenVieja:string
        } = req.body

    try {
        // Verifica si se envio una nueva imagen y la obtiene
        const  imgPura  = (req.files?req.files.img:undefined) as fileUpload.UploadedFile// Obtiene la imagen 
        let imgURL:string // Se inicia la variable que va a contener el path de la foto de perfil del usuario

        if(categoria){ // Si se envia el nombre de una categoria entonces la busca en la base de datos y remplaza el nombre por su ObjectID
            const objetoCategoria:CategoriaI|null = (await Categoria.findOne({'nombre':categoria}))!
            if(!objetoCategoria) {
                return res.status(400).json({
                    errors:[{
                        msg: "La categoria no es valida",
                        path: "categoria"
                    }]
                })
            }
            categoria = objetoCategoria._id.toString()
        }

        // Si se reciben especificaciones entonces le da el formato correcto
        let especificaciones:EspecificacionI[] = []
        if(especificacionesJSON){ 
            especificaciones=JSON.parse(especificacionesJSON)
        }

        // Estructura la informacion para enviarla correctamente al servidor
        const data={
            nombre,
            marca,
            modelo,
            usuario,
            categoria,
            descripcion,
            precio,
            precioViejo,
            especificaciones,
            disponible,
            tags
        }

        // Busca por id en la base de datos que actualiza las propiedades que esten en el segundo parametro. { new: true } devuelve el documento actualizado
        let producto:producto = (await Producto.findByIdAndUpdate( id,data, { new: true }))!; 
        let esProductoModificado:boolean = false // Indica si el usuario fue modificado luego este este punto

        // Si se envia un URL de una imagen anterior entonces la elimina
        if(URLImagenVieja) { 
            try{
                producto = await eliminarFotoProducto(producto,URLImagenVieja) // Elimina la foto y devuelve el producto modificado
                esProductoModificado = true
            }catch(error){
                console.log(error)
                return res.status(500).json([{
                    errors:{
                        msg:(error as Error).message,
                        path:'Servidor'
                    }
                }])
            }

        }


        // Si se envia una foto de perfil del usuario entonces la sube al servidor
        if(imgPura){ 
            try {
                // Sube la foto al servidor
                imgURL = await subirFotoProducto(imgPura)
                // Agrega el url al array de imagenes del producto
                producto.imagenes.push(imgURL) // Guarda la imagen en el array de imagenes
                esProductoModificado = true
            } catch (error) {
                console.log(error)
                if ((error as error).path==='Servidor'){
                    return res.status(500).json({error})
                }
                return res.status(400).json(error)
            }
        }

        // Verifica si el usuario se modifico nuevamente
        if(esProductoModificado) producto.save() // Guarda los cambios en la base de datos


        res.status(200).json({ //Devuelve un mensaje y el producto agregado a la base de datos
            productoActualizado:producto
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al autenticar el usuario",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Procesa la foto recibida
const subirFotoProducto = async(img:fileUpload.UploadedFile) =>{
    // Recibe la foto de producto, la sube al servidor y devuelve el path de la imagen
    // Verifica la extension del archivo
    return new Promise<string>((resolve, reject) => {
        const nombreArchivoDividido = img.name.split('.')

        const extension = nombreArchivoDividido[nombreArchivoDividido.length - 1]
        const extensionesPermitidas = [`jpg`,`png`,`jpeg`,'webp','gif']
        if(!extensionesPermitidas.includes(extension)){
            return reject([{
                    msg: `Extension no permitida, las extensiones permitidas son: ${extensionesPermitidas}`,
                    path: "archivo"
                }])
        }
        if(img.size > 5 * 1024 * 1024){
            return reject([{
                    msg: `El archivo no debe superar los 5MB`,
                    path: "archivo"
                }])
        }


        // Define un nuevo nombre para el archivo
        let nombreArchivo:string
        nombreArchivo=uuidv4()+'.'+extension //Genera un nombre unico para la imagen


        // Ruta donde se va a colocar el archivo
        const uploadPath = path.join(__dirname,'../public/img/fotosProductos',nombreArchivo )
        // Mueve el archivo a la ruta definida
        img.mv(uploadPath,(err)=>{
            if (err){
                return reject([{
                        msg: `Error al guardar el archivo`,
                        path: "Servidor"
                    }])
            }
        })
    
        resolve('../img/fotosProductos/'+nombreArchivo)
    })
    

}

// Elimina un producto con el id pasado como parametro
const eliminarProducto = async(req: Request, res: Response) =>{

    const {id} = req.params; // Desestructura el id

    try{
        // Busca la producto con ese id y cambia su estado de actividad
        const productoEliminado = await Producto.findByIdAndUpdate( id , {estado: false}, { new: true }); 
        const usuarioAutenticado:usuario = req.body.producto
        res.status(200).json({
            productoEliminado,
            usuarioAutenticado
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al eliminar el producto",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

const eliminarFotoProducto = async(producto:producto,URLImagenVieja:string)=>{
    return new Promise<producto>(async (resolve, reject) => {
        const pathImagenVieja = path.join(__dirname, URLImagenVieja.replace('../', '../public/'));
        
        // Elimina el URL del array de imagenes del producto
        const indiceImagen = producto.imagenes.indexOf(URLImagenVieja);
        if (indiceImagen !== -1) producto.imagenes.splice(indiceImagen, 1); // Elimina el elemento del array de imágenes del producto

        // Verifica si el archivo existe antes de intentar eliminarlo, si no existe entonces lanza un error 
        try {
            await fs.promises.access(pathImagenVieja, fs.constants.F_OK);
            // Si existe, procede a eliminarlo
            fs.unlink(pathImagenVieja, (err) => {
                if (err) reject(new Error('No se pudo eliminar la imagen en el servidor'));
            });
        } catch (error) {}

        resolve(producto);
    });
    
}



export {
    verProductos,
    verProductoID,
    crearProducto,
    actualizarProducto,
    eliminarProducto
}

