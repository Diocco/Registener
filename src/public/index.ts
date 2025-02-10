import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import os from'os';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dialog } from 'electron';

// Crear la ventana de Electron
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, // Resolución de lanzamiento (ancho)
    height: 720, // Resolución de lanzamiento (alto)
    minWidth: 1024,
    minHeight: 768,
    // icon: path.join(__dirname, '../images/icon.ico'), // Ruta del icono
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

// Verificar e instalar el certificado ANTES de abrir la ventana principal
function instalarCertificado() {
  return new Promise<void>((resolve, reject) => {
      console.log("Verificando certificado SSL...");

      // Ruta original del certificado dentro del asar
      const certPath = path.join(__dirname, '../../certificates', 'isrgrootx1.der');

      // Ruta temporal donde se copiará el certificado si es necesario
      const tempCertPath = path.join(os.tmpdir(), 'isrgrootx1.der');

      // Verificar si el certificado ya está instalado
      exec(`certutil -store "Root"`, (error, stdout, stderr) => {
          if (error) {
              console.error("Error verificando certificados:", stderr);
              return reject(error);
          }

          if (stdout.includes("ISRG Root X1")) {
              console.log("El certificado ya está instalado.");
              return resolve();
          } 

          console.log("Certificado no encontrado. Procediendo a la instalación...");

          // Copiar el certificado a la carpeta temporal
          fs.copyFile(certPath, tempCertPath, (copyError) => {
              if (copyError) {
                  console.error("Error copiando el certificado:", copyError);
                  return reject(copyError);
              }

              console.log("Certificado copiado a:", tempCertPath);

              // Instalar el certificado
              exec(`certutil -addstore "Root" "${tempCertPath}"`, (installError, installStdout, installStderr) => {
                  if (installError) {
                      console.error("Error instalando el certificado:", installStderr);
                      dialog.showErrorBox("Error", "No se pudo instalar el certificado, pruebe iniciando la aplicación como administrador");
                      return reject(installError);
                  } else {
                      console.log("Certificado instalado correctamente.");
                      return resolve();
                  }
              });
          });
      });
  });
}

// Cuando Electron esté listo, crear la ventana
app.whenReady().then(async () => {

  await instalarCertificado(); // Espera a que termine
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