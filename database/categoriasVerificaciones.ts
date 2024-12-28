import Categoria from "../src/models/categoria.js";

// Verifica si la categoria existe mediante su id
const categoriaExiste = async(id:string) =>{
    try {
        const existe = await Categoria.findById(id) // Verifica si en la base de datos haya un objeto que tenga el id pasado como argumento
        if(!existe){ // Si la categoria no existe entonces:
            throw new Error(`La categoria con id: ${id}, no existe`);
        };
    } catch (error) { // Si el id no es valido entonces:
        throw new Error(`El id: ${id}, no es valido`);
    }
}

const categoriaValida = async (id:string) => { 
    try {
        const categoriaExiste = await Categoria.findById(id); // Busca la categoria de entrada en la base de datos de categorias
        if (!categoriaExiste) { // Si la categoria no existe:
            throw new Error(`La categoria no es válida`); // Lanza un error dentro del check (el codigo sigue ejecutandose)
        }
    } catch (error) {
        throw new Error(`La categoria no tiene un formato valido`); // Lanza un error dentro del check (el codigo sigue ejecutandose)
    }

}


export{
    categoriaExiste,
    categoriaValida
}