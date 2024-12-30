import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import 'dotenv/config';
import cors from 'cors'

// Directorio
const __filename = fileURLToPath(import.meta.url); // Obtiene el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual

// Base de datos
import  conexionDB  from '../routes/conexionConServidor.js'

// Controladores
import { 
    cargarRegistener,
    } from '../controllers/archivos.js';

// Rutas
import usuariosRoutes from '../routes/usuarios.js';
import authRoutes from '../routes/auth.js'; 
import metodosPagoRoutes from '../routes/metodosPago.js'; 
import categoriasRoutes from '../routes/categorias.js'; 
import productosRoutes from '../routes/productos.js'; 
import variantesRoutes from '../routes/variantes.js';
import registroVentasRoutes from '../routes/registroVentas.js';
import registroCajaRoutes from '../routes/registroCaja.js';

import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';



class Server {
    // Variables
    usuariosPath: string
    authPath: string
    categoriasPath:string
    productosPath:string
    registroCajaPath:string
    variantesPath:string
    registroVentasPath:string
    metodoPagoPath:string
    conexionConServidor:string

    app: express.Application;
    port: string | number;

    constructor() {
        this.usuariosPath = '/api/usuarios';
        this.authPath = '/api/auth';
        this.categoriasPath = '/api/categorias';
        this.productosPath = '/api/productos';
        this.variantesPath = '/api/variantes';
        this.registroVentasPath = '/api/registroVentas';
        this.registroCajaPath = '/api/registroCaja';
        this.metodoPagoPath = '/api/metodoPago';
        this.conexionConServidor = '/api/conexion';
        
        this.app = express(); // Instancia de Express
        this.port = process.env.PORT || 8080; // Puerto con valor predeterminado
        this.configureMiddleware();
        this.routes(); // Configura las rutas
    }

    async conectarDB(){ await mongoose.connect(process.env.MONGO_DB!); } // Esta linea es para que haya una conexion con los endpoits sin estar en la aplicacion, esta linea debe eliminarse en modo produccion


    // Configura middleware globalnpm
    configureMiddleware() {

        // Aplica las opciones de CORS a todas las rutas
        this.app.use(cors());

        // Servir archivos estáticos
        this.app.use(express.static(path.resolve(__dirname, '../../src/public')));

        // Parseo de JSON
        this.app.use(express.json());

        // Carga de archivos
        this.app.use(fileUpload());
    }

    // Configura las rutas
    routes() {
        
        // API
        this.app.use(this.conexionConServidor,conexionDB)
        this.app.use(this.usuariosPath, usuariosRoutes);
        this.app.use(this.authPath, authRoutes);
        this.app.use(this.categoriasPath, categoriasRoutes);
        this.app.use(this.metodoPagoPath, metodosPagoRoutes);
        this.app.use(this.productosPath, productosRoutes);
        this.app.use(this.variantesPath, variantesRoutes);
        this.app.use(this.registroVentasPath, registroVentasRoutes);
        this.app.use(this.registroCajaPath, registroCajaRoutes);
        
        // HTML
        this.app.get('*', cargarRegistener); // Configura la ruta
    }

    // Inicia el servidor
    start() {
        this.app.listen(this.port, () => {
            console.log(`Servidor escuchando en http://localhost:${this.port}`);
        });
    }
    
}

export default Server;