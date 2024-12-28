import express from 'express'; // Express
import { check } from 'express-validator'; // Validaciones

// Controladores
import { 
    verProductos,
    verProductoID,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from '../controllers/productos.js';

// Middlewares
import { 
    validarCampos,
    validarJWT,
    validarRolJWT
} from '../middlewares/index.js';


// Verificaciones con la base de datos
import {
    categoriaValida 
} from '../../database/categoriasVerificaciones.js';

import {
    productoExiste
} from '../../database/productosVerificaciones.js';


const router = express.Router();

router.get('/', // Obtener productos
    verProductos) 

router.get('/:id', // Obtener producto por id
    check('id').custom(productoExiste),
    validarCampos,
    verProductoID) 

router.post('/', // Crear producto - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador

    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('marca', 'La marca es obligatoria').notEmpty(),
    check('modelo', 'El modelo es obligatorio').notEmpty(),
    check('categoria', 'La categoria es obligatoria').notEmpty(),
    check('categoria').custom(categoriaValida),
    validarCampos,
    crearProducto) 

router.put('/:id', // Actualizar producto - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('id').custom(productoExiste),
    check('precio', 'El precio ingresado no es valido').optional().isNumeric(),
    validarCampos,
    actualizarProducto)


    
router.delete('/:id', // Actualizar producto - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('id').custom(productoExiste),
    validarCampos,
    eliminarProducto)


export default router;