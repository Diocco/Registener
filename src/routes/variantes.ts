import express from 'express'; // Express
import { check } from 'express-validator'; // Validaciones
import { validarCampos, validarJWT, validarRolJWT } from '../middlewares/index.js';
import { actualizarVariante, actualizarVariantes, aplicarVenta, crearVariante, verVariantes } from '../controllers/variantes.js';
import { SKUUnico, varianteExiste } from '../../database/variantesVerificaciones.js';
import { productoExiste } from '../../database/productosVerificaciones.js';
import { eliminarVariante } from '../controllers/variantes.js';



const router = express.Router();

router.post('/', // Crear variante - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('producto').custom(productoExiste),
    check('SKU', 'El SKU es obligatorio').notEmpty(),
    check('SKU').custom(SKU=>SKUUnico(SKU)),
    check('color').optional().isString(),
    check('talle').optional().isString(),
    check('stock', 'La stock no es valido').notEmpty().isNumeric(),
    validarCampos,
    crearVariante) 

router.get('/:productoId', // Ver variantes
    check('productoId').custom(productoExiste),
    validarCampos,
    verVariantes) 

router.put('/venta', // Aplica una venta - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    validarCampos,
    aplicarVenta) 

router.put('/:productoId', // Actualizar variantes - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('variantes', 'La o las variantes son obligatorias').notEmpty(),
    validarCampos,
    actualizarVariantes) 

router.put('/modificar/:varianteId', // Actualizar variante - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('varianteId').custom(varianteExiste),
    check('esFavorito','Definir si es favorito es obligatorio').notEmpty(),
    check('esFavorito','La definicion si es favorito no es valida').isBoolean(),
    check('stock','El stock es obligatorio').notEmpty(),
    check('stock','El stock no es valido').isNumeric(),
    validarCampos,
    actualizarVariante) 


router.delete('/:varianteId', // Actualizar variantes - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
    check('varianteId', 'El id de la variante es obligatoria').notEmpty(),
    check('varianteId').custom(varianteExiste),
    validarCampos,
    eliminarVariante) 

export default router