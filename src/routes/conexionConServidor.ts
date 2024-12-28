import express from 'express'; // Express
import { conexionDB } from "../controllers/conexionConServidor.js";

const router = express.Router();

router.get('/', // Intentar conexion con el servidor
    conexionDB) 

    export default router;