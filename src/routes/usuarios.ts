import express from 'express'; // Express
import { check } from 'express-validator'; // Validaciones

// Controladores
import { 
    actualizarUsuario,
    agregarUsuario, 
    eliminarUsuario, 
    modificarDeseado, 
    verDeseados, 
    verUsuarios,
    verUsuarioToken,
    subirFotoPerfil
} from '../controllers/usuarios.js';

// Middlewares
import { 
    validarCampos,
    validarJWT,
    validarRolJWT,
    validarIDJWT } from '../middlewares/index.js';


// Verificaciones con la base de datos
import { 
    esRolValido, 
    correoUnico, 
    nombreUnico, 
    usuarioExiste } from '../../database/usuariosVerificaciones.js';
import { productoExiste } from '../../database/productosVerificaciones.js';


const router = express.Router();

router.post('/', // Crea un nuevo usuario
    check('nombre', 'El nombre es obligatorio').notEmpty(), // Verifica que el nombre no este vacio
    check('password', 'La contraseña es debe tener entre 8 y 20 caracteres').isLength({min:8,max:20}), 
    check('correo', 'El correo no es valido').isEmail(), // Verifica que el email sea valido
    check('correo').custom( correoUnico ), 
    validarCampos, // Devuelve un error al usuario si algun check fallo
    agregarUsuario) // Agrega un nuevo usuario a la base de datos

// Actualiza la lista de productos deseados del usuario
router.put('/listaDeseados/:idProducto', 
    validarJWT,
    check('idProducto').custom(productoExiste),
    validarCampos, // Devuelve un error al usuario si algun check fallo
    modificarDeseado)

// Devuelve la lista de productos deseados
router.get('/listaDeseados', 
    validarJWT,
    validarCampos, // Devuelve un error al usuario si algun check fallo
    verDeseados) 

router.put('/', //Actualiza un usuario
    validarJWT,
    check('password', 'La contraseña es debe tener entre 8 y 20 caracteres').optional().isLength({min:8,max:20}), // Si se manda una contraseña verifica que sea valida
    check('correo', 'El correo no es valido').optional().isEmail(), // Si se manda un correo verifica que sea valido
    check('correo').optional().custom( correoUnico ), 
    check('telefono', 'El numero de telefono no es valido').optional().isMobilePhone('es-AR'), // Si se manda un correo verifica que sea valido
    validarCampos, // Devuelve un error al usuario si algun check fallo
    actualizarUsuario) // Agrega un nuevo usuario a la base de datos

router.get('/', // Devuelve los usuarios
    verUsuarios) 

router.get('/token/', // Obtener usuario por id
    validarJWT,
    validarCampos,
    verUsuarioToken) 

router.delete('/:id', // Elimina el usuario con el id pasado como parametro
    validarJWT,
    validarRolJWT('admin'),
    check('id').custom( usuarioExiste ), // Verifica existencia y validez del id
    validarCampos, // Devuelve un error al usuario si algun check fallo
    eliminarUsuario)


export default router;