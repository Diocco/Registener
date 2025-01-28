import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Directorio
const __filename = fileURLToPath(import.meta.url); // Obtiene el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual

// Crear la ventana de Electron
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, // Resolución de lanzamiento (ancho)
    height: 720, // Resolución de lanzamiento (alto)
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../images/icon.ico'), // Ruta del icono
    webPreferences: {
      nodeIntegration: false, // No habilitar la integración de Node.js en el frontend
      contextIsolation: true,  // Mantener el contexto aislado
    },
  });

  mainWindow.webContents.openDevTools();

  mainWindow.loadFile(path.join(__dirname, 'views/registener.html')) // Carga el html con todo el programa

  // // Ocultar la barra de menú
  // mainWindow.setMenu(null);

  // Abre las herramientas de desarrollo si se está en modo desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


// Cuando Electron esté listo, crear la ventana
app.whenReady().then(() => {

  // Crear la ventana de la aplicación Electron
  createWindow();

  // Si hay otras ventanas abiertas, salir de la aplicación cuando todas se cierren
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});

// En macOS, es común volver a crear la ventana cuando se vuelve a abrir la aplicación
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});