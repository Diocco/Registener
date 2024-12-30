import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Directorio
const __filename = fileURLToPath(import.meta.url); // Obtiene el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual

const cargarRegistener = (req: Request, res: Response) => {
    // Construir la ruta absoluta al archivo HTML
    const filePath = path.join(__dirname, '../../src/public/views/registener.html');
    res.sendFile(filePath);
};

export {
    cargarRegistener
};