import express from 'express'; // Express
import { check } from 'express-validator'; // Validaciones

// Controladores
import { 
    verCategorias,
    verCategoriaID,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from '../controllers/categorias.js';

// Middlewares
import { 
    validarCampos,
    validarJWT,
    validarRolJWT
} from '../middlewares/index.js';


// Verificaciones con la base de datos
import {categoriaExiste } from '../../database/categoriasVerificaciones.js';


const router = express.Router();

router.get('/', // Obtener categorias
    verCategorias) 

router.get('/:id', // Obtener categoria por id
    check('id').custom(categoriaExiste),
    validarCampos,
    verCategoriaID) 

router.post('/', // Crear categoria - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    validarCampos,
    crearCategoria) 

router.put('/:id', // Actualizar categoria - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('id').custom(categoriaExiste),
    validarCampos,
    actualizarCategoria)
    
router.delete('/:id', // Actualizar categoria - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('id').custom(categoriaExiste),
    validarCampos,
    eliminarCategoria)


export default router;