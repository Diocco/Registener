import { ObjectId } from "mongoose"
import { variante } from "../../../models/interfaces/variante.js"
import { mostrarErroresConsola, tokenAcceso, urlVariantes } from "../global.js"
import { mostrarMensaje } from "../helpers/mostrarMensaje.js"
import { error } from "../../../interfaces/error.js"
import { ElementoCarritoI } from "../../../interfaces/elementoCarrito.js"

export const crearVariante = async(variante:variante)=>{
    let varianteId:ObjectId|undefined
    // Crea un formdata para enviar los datos de forma tal que se puedan ser chequeados por los middlewares
    const formData = new FormData()
    formData.append('producto',variante.producto.toString())
    formData.append('SKU',variante.SKU)
    formData.append('talle',variante.talle)
    formData.append('color',variante.color)
    formData.append('stock',variante.stock.toString())

    await fetch(urlVariantes, { 
        method: 'POST',
        headers: {'tokenAcceso' : `${tokenAcceso}`  },
        body:formData
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola (data.errors) // Si hay errores de tipeo los muestra en consola 
        else varianteId = data._id // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
    })

    return varianteId
}

export const eliminarVariante = async(varianteId:string)=>{

    let respuesta:number|undefined

    await fetch(urlVariantes+`/${varianteId}`, { 
        method: 'DELETE',
        headers: {'tokenAcceso' : `${tokenAcceso}`  },
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola(data.errors) // Si hay errores de tipeo los muestra en consola 
        else respuesta=0 // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
    })
    return respuesta

}

export const actualizarVariantes = async(variantes:variante[],productoId:string)=>{

    let respuesta:error[]|undefined
    await fetch(urlVariantes+`/${productoId}`, { 
        method: 'PUT',
        headers: {'Content-Type': 'application/json',
            'tokenAcceso' : `${tokenAcceso}` },
        body: JSON.stringify({variantes})
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
        if(data.errors) respuesta=data.errors // Si hay errores de tipeo los muestra en consola 
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
        const errors:error[]=[{
            msg: error.message,
            path: "Servidor",
            value: ""
        }]
        return errors
    })
    return respuesta
}

export const actualizarVariante= async(datosProducto:FormData,varianteId:string)=>{
    let respuesta:{
        varianteActualizada:variante|undefined,
        errors:error[]
    }={
        varianteActualizada: undefined,
        errors: []
    }

    await fetch(urlVariantes+`/modificar/${varianteId}`, {
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
        else respuesta.varianteActualizada = data.varianteActualizada // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        console.error(error);
        mostrarMensaje('2',true);
    })

    return respuesta
}

export const verVariantes = async(productoId:ObjectId)=>{
    let respuesta:variante[]|undefined
    // Envia el id del producto y el servidor devuelve todas las variantes para ese producto
    await fetch(urlVariantes+`/${productoId.toString()}`, { 
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola(data.errors) // Si hay errores de tipeo los muestra en consola 
        else respuesta=data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
        return undefined
    })
    return respuesta
}

export const aplicarVenta = async(carrito:ElementoCarritoI[])=>{


    // Recibe como parametro el carrito y lo envia al servidor
    let respuesta:number|undefined
    await fetch(urlVariantes+`/venta`, { 
        method: 'PUT',
        headers: {'Content-Type': 'application/json' ,
                    'tokenAcceso':`${tokenAcceso}`}  ,
        body: JSON.stringify({carrito})
    })
    .then(response => response.json()) // Parsear la respuesta como JSON
    .then(data=> { // Si todo sale bien se maneja la respuesta del servidor
        if(data.errors) mostrarErroresConsola(data.errors) // Si hay errores de tipeo los muestra en consola 
        else respuesta=data // Si el servidor no devuelve errores guarda la respuesta
    })
    .catch(error => { // Si hay un error se manejan 
        mostrarMensaje('2',true);
        console.error(error);
        return undefined
    })
    return respuesta
}
