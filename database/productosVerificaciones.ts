import Producto from "../src/models/productos.js";


// Verifica que el producto exista
const productoExiste = async(id:string) =>{
    let productoDB  // Inicializa una variable que almacena el producto de la base de datos
    try {
        if(!id) throw new Error(`EL id del producto es obligatorio`);
        productoDB = await Producto.findById(id) // Verifica si en la base de datos haya un objeto que tenga el id pasado como argumento
    } catch (error) {
        throw new Error(`Id no valido`);
    }
    if(!productoDB){ // Si el producto no existe entonces:
        throw new Error(`El producto con id: ${id}, no existe`);
    }else if(!productoDB.estado){ // Si el producto existe pero no tiene estado activo entonces:
        throw new Error(`El producto con id: ${id}, no esta activado`);
    }
}


export{
    productoExiste
}