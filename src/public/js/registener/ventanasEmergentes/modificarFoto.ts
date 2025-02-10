import { ObjectId } from "mongoose";
import { producto } from "../../../../interfaces/producto.js";
import { tokenAcceso, urlProductos } from "../../global.js";
import { mostrarMensaje } from "../../helpers/mostrarMensaje.js";
import { agregarImagenesDOM, productoVentanaModificar } from "./modificarProducto.js";
import { preguntar } from "./preguntar.js";
import { error } from "../../../../interfaces/error.js";
import { subirFotoProducto } from "../../services/productosAPI.js";
import { obtenerFormatoImagen } from "../../helpers/obtenerFormatoImagen.js";

const contenedorVentanaModificar:HTMLElement = document.getElementById('ventana__modProd')! // Ventana emergente para modificar el producto
const ventanaImagenVariante:HTMLElement = document.getElementById('ventana__cargarFoto')! // Ventana emergente para modificar o visualizar una imagen del producto

const contenedorImagen = document.getElementById('ventana__cargarFoto-img')! as HTMLImageElement; // Contenedor de la imagen del producto
const cargarImagenInput = document.getElementById('ventana__cargarFoto-input')! as HTMLInputElement; // Input para cargar una nueva imagen para el producto
const botonEliminarImagen = document.getElementById('ventana__cargarFoto-eliminar')! // Boton para eliminar la imagen actual del producto
const reader = new FileReader(); // Crear un objeto FileReader para manejar la foto que suba el usuario
let imagenNueva:string|undefined // Variable que contiene la nueva imagen subida

const botonGuardar = document.getElementById('ventana__cargarFoto-guardar')! as HTMLButtonElement; // Boton para volver a la ventana de modificar producto
const botonVolver = document.getElementById('ventana__cargarFoto-volver')! as HTMLButtonElement; // Boton para guardar los cambios realizados y volver a la ventana de modificar producto


export const ventanaEmergenteCargarImagenProducto = (numeroImagen:number)=>{

    // Reinicia el contenedor de imagen y el input para subir imagenes
    contenedorImagen.src="../../images/sinfoto.png";
    contenedorImagen.setAttribute('data-numeroImagen',numeroImagen.toString())
    cargarImagenInput.value=''
    imagenNueva=undefined

    // Si se recibe, coloca la imagen presionada en el contenedor para visualizarla
    if(numeroImagen>-1){
        // Determina cual es el formato original de la imagen
        imagenNueva = productoVentanaModificar!.imagenes[numeroImagen]
        let formatoImagen = obtenerFormatoImagen(imagenNueva)
        contenedorImagen.src=`data:image/${formatoImagen};base64,${imagenNueva}`; // Establece la imagen como fondo del div
    }else{
        numeroImagen = productoVentanaModificar!.imagenes.length // Si el numero imagen es "-1" el usuario presiono en agregar imagen, por lo tanto define el numeroImagen como el ultimo elemento vacio
    }

    // Activa la ventana emergente de agregar o visualizar imagen a la variante
    ventanaImagenVariante.classList.remove('noActivo')
    
    // Desactiva la ventana de modificar producto
    contenedorVentanaModificar.classList.add('noActivo')
    
    // Espera la respuesta del usuario
    new Promise<boolean>((resolve) => {
        botonGuardar.onclick=()=>resolve(true)
        botonVolver.onclick=()=>resolve(false)
    })
    .then(async(guardar)=>{
        if(guardar && imagenNueva) productoVentanaModificar!.imagenes[numeroImagen] = imagenNueva // Coloca la imagen recien subida remplazando la imagen vieja
        agregarImagenesDOM()
    })
    .then(()=>{
        // Desactiva la ventana emergente de agregar o visualizar imagen a la variante
        ventanaImagenVariante.classList.add('noActivo')
        
        // Activa la ventana de modificar producto
        contenedorVentanaModificar.classList.remove('noActivo')
    })
    .catch(error=>{
        mostrarMensaje('2',true)
        console.log(error)
    })

}

document.addEventListener('DOMContentLoaded',()=>{
    // Escucha si el usuario presiona el boton de eliminar imagen
    botonEliminarImagen.onclick=async()=>{
        ventanaImagenVariante.classList.add('noActivo') // Desactiva la ventana emergente de agregar o visualizar imagen a la variante
        const respuesta:boolean = await preguntar('¿Estas seguro que desea eliminar la imagen?')
        if(respuesta){
            const numeroImagen = Number(contenedorImagen.getAttribute('data-numeroImagen')!)
            productoVentanaModificar!.imagenes.splice(numeroImagen,1) // Elimina la imagen actual
            contenedorVentanaModificar.classList.remove('noActivo') // Activa la ventana emergente para modificar el producto 
            ventanaImagenVariante.classList.add('noActivo') // Desactiva la ventana emergente de agregar o visualizar imagen a la variante
            agregarImagenesDOM() // Recarga las imagenes del DOM para aplicar los cambios
        }else{
            ventanaImagenVariante.classList.remove('noActivo') // Desactiva la ventana emergente de agregar o visualizar imagen a la variante
        }
    }

    // Escucha si el usuario carga una nueva imagen
    cargarImagenInput.addEventListener('change', () => {
        try {
            if(cargarImagenInput.files){ // Si hay un archivo cargado 
                const imagen = cargarImagenInput.files[0]; // Obtener el primer archivo
    
                reader.readAsDataURL(imagen); // Leer el archivo como URL de datos

                reader.onload = (e) => {
                    imagenNueva = (reader.result as string).split(",")[1]; // Extrae solo el Base64
                    contenedorImagen.src=reader.result as string; // Establece la imagen como fondo del div
                };
            }
        } catch (error) {
            mostrarMensaje('Hubo un error al cargar la imagen',true)
            console.log(error)
        }
        
    })
})