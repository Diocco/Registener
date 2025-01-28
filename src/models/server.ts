import express from 'express';
import 'dotenv/config';
import cors from 'cors'


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


    // Configura middleware globalnpm
    configureMiddleware() {

        // Aplica las opciones de CORS a todas las rutas
        this.app.use(cors());

        // Parseo de JSON
        this.app.use(express.json());

        // Carga de archivos
        this.app.use(fileUpload());
    }

    // Configura las rutas
    routes() {
        
        // API
        this.app.use(this.usuariosPath, usuariosRoutes);
        this.app.use(this.authPath, authRoutes);
        this.app.use(this.categoriasPath, categoriasRoutes);
        this.app.use(this.metodoPagoPath, metodosPagoRoutes);
        this.app.use(this.productosPath, productosRoutes);
        this.app.use(this.variantesPath, variantesRoutes);
        this.app.use(this.registroVentasPath, registroVentasRoutes);
        this.app.use(this.registroCajaPath, registroCajaRoutes);
        
    }

    // Inicia el servidor
    start() {
        this.app.listen(this.port, async () => {
            try {
                //Conecta la base de datos usando la variable global como argumento
                await mongoose.connect(process.env.MONGO_DB!);
                console.log("Base de datos conectada con exito");
            } catch (error) {
                console.log("No se pudo conectar con la base de datos");
                throw new Error("No se pudo conectar con la base de datos");
            }
            console.log(`Servidor escuchando en el puerto ${this.port}`);
        });
    }
    
}

export default Server;