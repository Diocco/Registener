import Role from "../src/models/rol.js";
import Usuario from '../src/models/usuario.js';

// Verifica que el rol sea valido
const esRolValido = async (rol:string) => { 
    const rolExistente = await Role.findOne({ rol }); // Busca el rol de entrada en la base de datos de roles
    if (!rolExistente) { // Si el rol no existe:
        throw new Error(`El rol ${rol} no es válido`); // Lanza un error dentro del check (el codigo sigue ejecutandose)
    }
}

// Verifica que el correo NO exista en la base de datos
const correoUnico = async(correo:string) =>{
    const existe = await Usuario.findOne({correo}) // Verifica si en la base de datos haya un objeto que tenga una categoria "parametro" con el mismo valor que el correo pasado como argumento en el body
    if(existe){ // Si el mail es encontrado entonces:
        throw new Error(`El correo: ${correo}, ya esta registrado`);
    };
}
// Verifica que el correo ya exista en la base de datos
const correoExiste = async(correo:string) =>{
    const existe = await Usuario.findOne({correo,activo:true}) // Verifica si en la base de datos haya un usuario ACTIVO que tenga una categoria "parametro" con el mismo valor que el correo pasado como argumento en el body
    if(!existe){ // Si el email NO es encontrado entonces:
        throw new Error(`El correo: ${correo}, no esta registrado`);
    };
}

// Verifica que el nombre sea unico 
const nombreUnico = async(nombre:string) =>{
    const existe = await Usuario.findOne({nombre}) // Verifica si en la base de datos haya un objeto que tenga una categoria "parametro" con el mismo valor que el correo pasado como argumento en el body
    if(existe){ // Si el mail es encontrado entonces:
        throw new Error(`El nombre: ${nombre}, ya esta registrado`);
    };
}

// Verifica si el usuario existe mediante su id
const usuarioExiste = async(id:string) =>{
    try {
        const existe = await Usuario.findById(id) // Verifica si en la base de datos haya un objeto que tenga el id pasado como argumento
        if(!existe){ // Si el usuario no existe entonces:
            throw new Error(`El id: ${id}, no existe`);
        };
    } catch (error) { // Si el id no es valido entonces:
        throw new Error(`El id: ${id}, no existe`);
    }
}


export {
    esRolValido,
    correoUnico,
    correoExiste,
    nombreUnico,
    usuarioExiste,
}