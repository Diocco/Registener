
import { ObjectId } from "mongoose";
import { error } from "../../../interfaces/error.js";
import { producto } from "../../../models/interfaces/producto.js";
import { mostrarErroresConsola, tokenAcceso, urlCategorias, urlProductos } from "../global.js";
import { mostrarMensaje } from "../helpers/mostrarMensaje.js";
import { CategoriaI } from "../../../models/interfaces/categorias.js";




// Realiza la peticion GET para obtener los productos
export const obtenerProductos=async(desde:string='',cantidadElementos:string='',precioMin:string='',precioMax:string='',palabraBuscada:string='',categorias:string='',ordenar:string='',categoriasNombre:string='',SKUBuscado:string='',pagina:string='')=>{
    let respuesta:{
        productos:producto[],
        categoriasCompletas:CategoriaI[],
        paginasCantidad:number
    } = {
        productos: [],
        categoriasCompletas:[],
        paginasCantidad:0
    }
    await fetch(urlProductos+`?variantes=true&desde=${desde}&cantidadElementos=${cantidadElementos}&precioMin=${precioMin}&precioMax=${precioMax}&palabraBuscada=${palabraBuscada}&categorias=${categorias}&ordenar=${ordenar}&categoriasNombre=${categoriasNombre}&SKUBuscado=${SKUBuscado}&pagina=${pagina}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else { // Si no hay errores entonces almacena la respuesta del servidor
            respuesta.productos = data.productos 
            respuesta.categoriasCompletas = data.categoriasCompletas 
            respuesta.paginasCantidad = data.paginasCantidad 
        }
    })
    .catch(error => { // Si hay un error se manejan y se muestra en consola
        mostrarMensaje('2',true);
        console.error(error);
    })

    return respuesta
}


// Carga las categorias validas en el DOM
export const buscarCategoriasValidas=async()=>{
    let nombreCategorias:string[] = []
    await fetch(
        urlCategorias+`?nombres=true`, { // Realiza la peticion GET para obtener un string[] con los nombres de las categorias validas
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else nombreCategorias = data.categorias // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true)
        console.error(error);
    })
    return nombreCategorias
}

// Sube una nueva foto del producto al servidor
export const subirFotoProducto =async(productoID:string,imagenNueva?:File,URLImagenVieja?:string)=>{
    
    const formData = new FormData()
    if(imagenNueva) formData.append('img',imagenNueva) // Si se envia una imagen para agregar, la agrega al FormData
    if(URLImagenVieja) formData.append('URLImagenVieja',URLImagenVieja) // Si se envia una imagen para eliminar la agrega al FormData

    return actualizarProducto(formData,productoID)
}

export const actualizarProducto= async(datosProducto:FormData,productoId:string)=>{
    let respuesta:{
        productoActualizado:producto|undefined,
        errors:error[]
    }={
        productoActualizado: undefined,
        errors: []
    }

    await fetch(urlProductos+`/${productoId}`, {
        method: 'PUT',
        headers: { 'tokenAcceso':`${tokenAcceso}`},
        body: datosProducto
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) {
            respuesta.errors = data.errors // Si hay errores de tipeo los muestra en consola 
            mostrarErroresConsola (data.errors)
        }
        else respuesta.productoActualizado = data.productoActualizado // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}

export const crearProducto= async(datosProducto?:FormData):Promise<producto | undefined>=>{

    if(!datosProducto){
        datosProducto = new FormData()
        datosProducto.append('nombre','Sin nombre')
        datosProducto.append('marca','Sin marca')
        datosProducto.append('modelo','Sin modelo')
        datosProducto.append('categoria','672956b70e8cd0e8b1fee8aa') // Id de la categoria "Sin categoria"
    }

    let productoCreado:producto|undefined = undefined

    await fetch(urlProductos, {
        method: 'POST',
        headers: { 'tokenAcceso':`${tokenAcceso}`},
        body: datosProducto
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else productoCreado = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return productoCreado
}

export const obtenerProducto =async (productoId:string)=>{
    let producto:producto|undefined
    
    await fetch(urlProductos+`/${productoId}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
        })
    .then(response => response.json()) // Parsea la respuesta 
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else producto = data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return producto
}

export const solicitudEliminarProducto =async (productoId:string)=>{

    let productoEliminado:producto|undefined

    await fetch(urlProductos+`/${productoId}`, { 
        method: 'DELETE',
        headers: {  'Content-Type': 'application/json' ,
                    'tokenAcceso' : `${tokenAcceso}`  },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else productoEliminado = data.productoEliminado // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return productoEliminado
}