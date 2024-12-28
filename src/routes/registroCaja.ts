import express from 'express'; // Express
import { validarRolJWT,validarJWT, validarCampos } from '../middlewares/index.js';
import { check } from 'express-validator';
import { eliminarRegistroVenta, modificarRegistro, registrarVenta, verRegistro, verRegistroVentas } from '../controllers/registroVentas.js';
import { registroVentaExiste } from '../../database/registroVentaVerificaciones.js';
import { mediosDePagoValido } from '../../database/registroCajaVerificaciones.js';
import { registrarCierreCaja, verRegistroCaja } from '../controllers/registroCaja.js';

const router = express.Router();

router.post('/', // Crear registro de caja - Admin
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador

    check('fechaApertura', 'La fecha de la apertura de caja es obligatoria').notEmpty(),
    check('fechaCierre', 'La fecha del cierre de caja es obligatorio').notEmpty(),
    check('usuarioApertura').optional().isString(),
    check('usuarioCierre').optional().isString(),
    check('mediosDePago').custom(mediosDePagoValido),
    check('observacion').optional().isString(),
    
    validarCampos,
    registrarCierreCaja) 

// router.get('/:id', // Obtener registro por ID
//     validarJWT, // Valida que el usuario que realiza la accion sea valido
//     verRegistro) 

router.get('/', // Obtener registros
    validarJWT, // Valida que el usuario que realiza la accion sea valido
    validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador

    verRegistroCaja) 

// router.put('/',
//     validarJWT, // Valida que el usuario que realiza la accion sea valido
//     validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
//     check('id','El id del registro es obligatorio').notEmpty(),

//     validarCampos,
//     modificarRegistro
// )

// router.delete('/:registroVentaID', // Eliminar producto - Admin
//     validarJWT, // Valida que el usuario que realiza la accion sea valido
//     validarRolJWT('admin'), // Valida que el usuario tenga permisos de administrador
//     check('registroVentaID').custom(registroVentaExiste),
//     validarCampos,
//     eliminarRegistroVenta)

export default router;