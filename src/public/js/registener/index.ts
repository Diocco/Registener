
import { ObjectId } from "mongoose"
import { CategoriaI } from "../../../models/interfaces/categorias.js"
import { producto } from "../../../models/interfaces/producto.js"
import { buscarCargarCategorias } from "../helpers/categorias.js"
import { obtenerProductos, solicitudEliminarProducto } from "../services/productosAPI.js"
import { agregarProductosDOM, alternarDisponibilidadProducto } from "./productos.js"
import { cargarVentanaModificarProducto, ventanaEmergenteModificarProducto } from "./ventanasEmergentes/modificarProducto.js"
import { preguntar } from "./ventanasEmergentes/preguntar.js"

import { url, usuarioVerificado } from "../global.js"
import { usuario } from "../../../models/interfaces/usuario.js"
import { cargarBotonesVentaPublico, cargarVentaPublico } from "./ventaPublico.js"
import { cargarRegistrosVentaDOM } from "./registroVentas.js"
import { actualizarIngresos, cargarSeccionCaja } from "./seccionCaja.js"
import { conexionConServidor } from "../services/conexionAPI.js"
import { MetodoPagoI } from "../../../models/interfaces/metodosPago.js"
import { verMetodosPago } from '../../../controllers/metodosPago';
import { solicitudObtenerMetodosPago } from "../services/metodosPagoAPI.js"
import { cambiarTema, cargarSeccionConfiguracion } from "./configuracion.js"
import { cargarSeccionRegistros } from "./registros.js"


// Cambia el tema de la aplicacion
cambiarTema(localStorage.getItem('temaSeleccionado')||'Escala de grises')
document.getElementById('ventanaCarga')!.classList.remove('noActivo')
document.getElementById('ventanaNegra')!.classList.add('noActivo')

//Variables globales
const contenedorProductos: HTMLElement = document.getElementById('configProductos__productos')!
export let productos:producto[]
export let categorias:CategoriaI[]|undefined
export let usuarioInformacion:usuario|undefined
export let metodosPago: MetodoPagoI[]

export const buscarCargarProductos =async()=>{ 
    // Define los query params para enviarlos en el fetch y asi filtrar los productos
    const params = new URLSearchParams(window.location.search);
    const desde = params.get('desde') || '0';
    const hasta = params.get('hasta') || '20';
    const precioMin = params.get('precioMin') || '';
    const precioMax = params.get('precioMax') || '';
    const palabraBuscada = params.get('palabraBuscada') || '';
    const categorias = params.get('categorias') || '';
    const ordenar = params.get('ordenar') || '';

    const respuesta = await obtenerProductos(desde,hasta,precioMin,precioMax,palabraBuscada,categorias,ordenar),
    productos = respuesta.productos


    await agregarProductosDOM(productos,contenedorProductos) // Si se encuentran productos para los parametros de busqueda entonces los agrega
    botonesSeccionProductos(productos) // Le da la funcion a los botones de cada producto
}

//Carga la seccion de seleccion de productos, se ejecuta cada vez que se hace click sobre la barra lateral para desplazarse a este mismo
function botonesSeccionProductos(productos:producto[]) {
    const botonAgregarProductos = document.getElementById('configProductos__agregarProducto')! as HTMLButtonElement
    botonAgregarProductos.onclick=(event)=>{
        event.stopPropagation()
        ventanaEmergenteModificarProducto() // Abre la ventana emergente para modificar un producto, al no pasarle ningun ID la funcion crea un producto nuevo.
    }
    // Le da la funcion a los botones de alternar disponibilidad de un producto
    const botonesDisponibilidad: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.producto__disponibilidad')
    botonesDisponibilidad.forEach((boton)=>{
        boton.onclick =(event)=>{
            event.stopPropagation()
            const idProducto = boton.parentElement!.parentElement!.id!
            const estaDisponible = boton.classList.contains('boton__activo')
            alternarDisponibilidadProducto(idProducto,estaDisponible,boton)
        }
    })

    // Le da la funcion a los botones de modificar un producto
    const productosDOM: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.configProductos__producto')
    productosDOM.forEach((productoDOM)=>{
        productoDOM.onclick =(event)=>{
            event.stopPropagation()
            const idProducto = productoDOM.id! // Obtiene el id del producto que se desea modificar
            const productoInformacion = productos.find(producto => producto._id.toString() === idProducto)! // Busca el id en el array de productos previamente buscado
            ventanaEmergenteModificarProducto(productoInformacion) // Envia la informacion del producto a la ventana emergente para modificar el producto
        }
    })

    // Le da la funcion a los botones de eliminar un producto
    const botonesEliminar: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.producto__eliminar')
    botonesEliminar.forEach((boton)=>{
        boton.onclick =async(event)=>{
            event.stopPropagation()
            const idProducto = boton.parentElement!.parentElement!.id!
            const respuesta:boolean = await preguntar('¿Estas seguro que quieres eliminar este producto?')
            if(respuesta) {
                const productoEliminado = await solicitudEliminarProducto(idProducto)
                if(productoEliminado) buscarCargarProductos() // Si el servidor no devuelve errores vuelve a cargar los productos            
            }
        }
    })
}





const cargarBotonesBarraLateral=()=>{
    //Carga y le da funciones a la barra lateral
    const configuracionProductosVentana = document.getElementById("configProductos")!
    const seleccionProductosVentana = document.getElementById("seleccionProductos")!
    const seleccionCaja = document.getElementById("seleccionCaja")!
    const contenedorRegistros = document.getElementById('registros')! as HTMLElement
    const configuracion = document.getElementById("configuracion")!

    const ventanas = document.querySelectorAll('.contenedorRegistener1')

    document.getElementById("barraLateral_A__icono")!.addEventListener("click",()=>{
        ventanas.forEach(contenedor=>contenedor.classList.add('noActivo')) // Esconde todos las secciones
        configuracionProductosVentana.classList.remove('noActivo')
    });
    document.getElementById("barraLateral_B__icono")!.addEventListener("click",()=>{
        ventanas.forEach(contenedor=>contenedor.classList.add('noActivo')) // Esconde todos las secciones
        seleccionProductosVentana.classList.remove('noActivo')
        cargarVentaPublico()
    });
    document.getElementById("barraLateral__caja")!.addEventListener("click",()=>{
        ventanas.forEach(contenedor=>contenedor.classList.add('noActivo')) // Esconde todos las secciones
        seleccionCaja.classList.remove('noActivo')
        actualizarIngresos()
    });
    document.getElementById("barraLateral_C__icono")!.addEventListener("click",()=>{
        ventanas.forEach(contenedor=>contenedor.classList.add('noActivo')) // Esconde todos las secciones
        contenedorRegistros.classList.remove('noActivo')
    });
    document.getElementById("barraLateral_AA__icono")!.addEventListener("click",()=>{
        ventanas.forEach(contenedor=>contenedor.classList.add('noActivo')) // Esconde todos las secciones
        configuracion.classList.remove('noActivo')
    });
}






document.addEventListener("DOMContentLoaded", async function() {

    // Busca y carga los productos en el contenedor pasado como argumento
    const contenedorCategorias:HTMLElement = document.getElementById('configProductos__categorias')!
    const contenedorOpcionesCategorias = document.getElementById('ventana__modProd__caracteristicas__select__categoria')! as HTMLSelectElement
    const textoErrorCarga = document.getElementById('ventanaCarga__texto')!


    let esConexionExitosa:boolean

    [usuarioInformacion,,categorias,,esConexionExitosa,metodosPago] = await Promise.all([
        usuarioVerificado,
        buscarCargarProductos(), // Busca y carga los productos
        buscarCargarCategorias(contenedorCategorias,contenedorOpcionesCategorias), // Busca y carga las categorias
        cargarBotonesBarraLateral(),
        conexionConServidor(),
        solicitudObtenerMetodosPago()
    ])

    // Si no se inicio sesion reedirije al usuario a la pagina de inicio de sesion
    if(!usuarioInformacion) {
        localStorage.setItem('mostrarMensajeError',"Inicia sesion primero") // Define un mensaje de error para que sea mostrado al usuario una vez que carge la pagina a la que se redirige
        window.location.assign(url+'/inicioSesion') // Redirije al usuario al inicio de sesion
        return
    }

    // Si el usuario no tiene los permisos necesarios entonces lo devuelve al inicio de la pagina
    if(usuarioInformacion.rol!=='admin') {
        localStorage.setItem('mostrarMensajeError',"Usted no posee los permisos necesarios") // Define un mensaje de error para que sea mostrado al usuario una vez que carge la pagina a la que se redirige
        window.location.assign(url+'/') // Redirije al usuario al inicio de sesion
    }

    // Si se obtuvieron los metodos de pago carga la seccion de caja
    if(!metodosPago){
        textoErrorCarga.textContent='Error al cargar. Porfavor reinicie'
        console.error("Error al obtener los metodos de pago")
        return
    }

    // Si la conexion es exitosa y el usuario que inicio sesion es admin entonces retira la ventana de carga
    if(!esConexionExitosa){
        textoErrorCarga.textContent='Error al cargar. Porfavor reinicie'
        console.error("Error al conectar con la base de datos")
        return
    }

    cargarVentanaModificarProducto()
    cargarSeccionConfiguracion()
    cargarSeccionCaja()
    cargarBotonesVentaPublico() // Luego que se obtuvieron los metodos de pago carga los botones de la seccion de venta al publico
    cargarVentaPublico() // Carga el resto de la venta al publico
    cargarSeccionRegistros()

    document.getElementById('ventanaCarga')!.classList.add('ventanaCarga-desaparecer')
    setTimeout(() => {
        document.getElementById('ventanaCarga')!.classList.add('noActivo')
    }, 500);
});





