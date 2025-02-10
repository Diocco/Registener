import { EspecificacionI, producto } from "../../../../interfaces/producto.js";


import { ventanaEmergenteCargarImagenProducto } from "./modificarFoto.js";
import { actualizarProducto, crearProducto, solicitudEliminarProducto, solicitudObtenerImagen } from "../../services/productosAPI.js";
import { buscarCargarProductos, categorias, usuarioInformacion } from "../index.js";


import { variante } from "../../../../interfaces/variante.js";
import { actualizarVariantes, crearVariante, eliminarVariante } from "../../services/variantesAPI.js";
import { solicitudAgregarCategoria } from "../../services/categoriasAPI.js";
import { buscarCargarCategorias } from "../../helpers/categorias.js";
import { obtenerFormatoImagen } from "../../helpers/obtenerFormatoImagen.js";

// Contenedores de categorias
const contenedorCategorias:HTMLElement = document.getElementById('configProductos__categorias')!
const contenedorOpcionesCategorias = document.getElementById('ventana__modProd__caracteristicas__select__categoria')! as HTMLSelectElement


// Contenedores de la ventana emergente
const contenedorVentanaEmergente:HTMLElement = document.getElementById('ventanaEmergenteFondo')!
const ventanaEmergente:HTMLElement = document.getElementById('ventana__modProd')!

// Contenedor de variantes de producto
const contenedorVariantes = document.getElementById('ventana__modProd__modVar__variantes')! as HTMLDivElement;

// Contenedor de las especificaciones de producto
const contenedorEspecificaciones = document.getElementById('ventana__modProd__modEspecif__especificaciones')! as HTMLDivElement;

// Input en donde el usuario agregara las diferentes caracteristicas del producto
const id = document.getElementById("ventana__modProd__caracteristicas__input__id")! as HTMLInputElement ;
const nombre = document.getElementById("ventana__modProd__caracteristicas__input__nombre")! as HTMLInputElement ;
const precio = document.getElementById("ventana__modProd__caracteristicas__input__precio")! as HTMLInputElement;
const marca = document.getElementById("ventana__modProd__caracteristicas__input__marca")! as HTMLInputElement;
const modelo = document.getElementById("ventana__modProd__caracteristicas__input__modelo")! as HTMLInputElement;
const categoria = document.getElementById("ventana__modProd__caracteristicas__select__categoria")! as HTMLSelectElement;
const categoriaIngresada = document.getElementById("ventana__modProd__caracteristicas__input__categoria")! as HTMLInputElement;
const descripcion = document.getElementById("ventana__modProd__fotoDescripcion__textarea")! as HTMLTextAreaElement;

// Botones
const aceptar:HTMLElement = document.getElementById("ventana__modProd__aceptar")!;
const cancelar:HTMLElement = document.getElementById("ventana__modProd__cancelar")!;
const botonAgregarVariante = document.getElementById('ventana__modProd__modVar__agregarVariante')! as HTMLButtonElement
const botonAgregarEspecificacion = document.getElementById('ventana__modProd__modEspecif__button')! as HTMLButtonElement

// Variable de la ventana
export let productoVentanaModificar:producto|undefined

// Ventana general
export const ventanaEmergenteModificarProducto = async(producto?:producto) =>{

    // Define al producto pasado como parametro como variable de la ventana
    productoVentanaModificar=producto

    // Elimina los estados de error previos, si existen
    contenedorVentanaEmergente.querySelectorAll('.boton__enError').forEach(botonEnError=>botonEnError.classList.remove('boton__enError'))

    // Activa la ventana emergente
    contenedorVentanaEmergente.classList.remove('noActivo')
    ventanaEmergente.classList.remove('noActivo')

    //Les da un valor inicial, borrando cualquier valor viejo que tenga
    id.value="";
    descripcion.value='';
    nombre.value="";
    precio.value="";
    marca.value="";
    modelo.value="";
    categoriaIngresada.value=''
    descripcion.textContent='';

    // Esconde la opcion para agregar una nueva categoria
    (document.getElementById('ventana__modProd__caracteristicas__input__categoria')! as HTMLInputElement).classList.add('noActivo')


    // Define la funcion del boton 
    let esCrearProducto=false
    if(!productoVentanaModificar) {
        productoVentanaModificar = await crearProducto() // Crea un nuevo producto
        esCrearProducto=true
    
    }; // Si a la funcion no se le pasa la informacion de un producto entonces crea uno nuevo
    if(!productoVentanaModificar) return // Si fallo la creacion del producto entonces resulta en un error fatal

    cargarVariantesDOM() // Carga la informacion de las variantes
    cargarEspecificacionesDOM() // Carga la informacion de las variantes
    cargarProductoDOM() // Carga en el DOM toda la informacion del producto
    agregarImagenesDOM(); // Carga las imagenes del producto en el DOM

    // Espera que el usuario aprete el boton "volver" antes de guardar todos los cambios, el bucle se repite hasta que el usuario introduzca todos los datos necesarios correctamente
    let nodosEnError:NodeListOf<HTMLInputElement>
    const formularioProducto = document.getElementById('ventana__modProd__caracteristicas')! as HTMLFormElement
    do {

        // Espera la respuesta del usuario
        await new Promise<void>((resolve) => {
            aceptar.onclick=()=>resolve();
            cancelar.onclick=async ()=>{
                if(esCrearProducto) await solicitudEliminarProducto(productoVentanaModificar!._id.toString()) // Si la ventana es para crear un producto, entonces lo elimina de la base de datos

                // Desactiva la ventana emergente
                contenedorVentanaEmergente.classList.add('noActivo')
                ventanaEmergente.classList.add('noActivo')
                buscarCargarProductos()
                return 
            };
        })

        let datosFormulario = new FormData(formularioProducto) // Lee los datos introducidos por el usuario

        // Toma los datos del producto en el formulario
        const especificaciones:EspecificacionI[] = obtenerEspecificacionesDOM()
        datosFormulario.set('especificacionesJSON',JSON.stringify(especificaciones))

        // Toma las imagen del producto
        datosFormulario.set('imagenesJSON',JSON.stringify(productoVentanaModificar.imagenes))

        // Si los hay, elimina los estados de error en la ventana emergente
        contenedorVentanaEmergente.querySelectorAll('.boton__enError').forEach(contenedor=>contenedor.classList.remove('boton__enError')) 

        await Promise.all([
            validarVariantesDOM(productoVentanaModificar._id.toString()), // Verifica que las variantes ingresadas sean validas
            validarCaracteristicasDOM(datosFormulario) // Verifica que las caracteristicas del producto sean validas
        ])

        // Busca estados de error
        nodosEnError = contenedorVentanaEmergente.querySelectorAll('.boton__enError')

        // Si no hay errores envia la solicitud para modificar el usuario 
        if(nodosEnError.length<1) {
            const respuesta = await actualizarProducto(datosFormulario,productoVentanaModificar._id.toString()); // Actualiza los datos del producto en la base de datos
            if(respuesta.errors.length>0){
                respuesta.errors.forEach(error=>{
                    if(error.path==='nombre') nombre.classList.add('boton__enError')
                    if(error.path==='precio') precio.classList.add('boton__enError')
                    if(error.path==='marca') marca.classList.add('boton__enError')
                    if(error.path==='modelo') modelo.classList.add('boton__enError')
                    if(error.path==='categoria') categoria.classList.add('boton__enError')
                })
            }
            // Vuelve a buscar nodos en estado de error
            nodosEnError = contenedorVentanaEmergente.querySelectorAll('.boton__enError')
        }

        // Vuelve a buscar nodos en estado de error
        } while (nodosEnError.length>0);

    
    // Desactiva la ventana emergente
    contenedorVentanaEmergente.classList.add('noActivo')
    ventanaEmergente.classList.add('noActivo')
    
    // Vuelve a cargar los productos actualizados
    buscarCargarProductos()
    buscarCargarCategorias(contenedorCategorias,contenedorOpcionesCategorias) 
    return

}


// Informacion del producto
export const agregarImagenesDOM = async()=>{
    // Imagen principal
    let imagenHTML = document.getElementById("ventana__modProd__fotoDescripcion__img")! as HTMLImageElement;
    const imagenBase64 = productoVentanaModificar!.imagenes[0] as string|undefined // Obtiene la primer imagen del producto en formato 64

    if(imagenBase64){
        // Determina cual es el formato original de la imagen
        let formatoImagen = obtenerFormatoImagen(imagenBase64)
        imagenHTML.src = `data:image/${formatoImagen};base64,${imagenBase64}` // Coloca la imagen del producto en el contenedor
    }else{
        imagenHTML.src = "../../images/sinfoto.png" // Vacia el contenedor de la imagen
    }

    // Contenedor de las imagenes de la variante
    const contenedorImagenes = document.getElementById('ventana__modProd__caracteristicas__div-imagenes')!
    contenedorImagenes.innerHTML='' // Vacia el contenedor de imagenes

    const fragmento = document.createDocumentFragment()

    // Agregar elementos que representan a las imagenes del producto
    for (let i = 0; i < productoVentanaModificar!.imagenes.length; i++) {
        const imagenDIV = document.createElement('div')
        imagenDIV.className="botonRegistener2"
        imagenDIV.textContent=(i+1).toString()
        imagenDIV.onclick=(event)=>{
            event.preventDefault()
            ventanaEmergenteCargarImagenProducto(i)
        }
        fragmento.appendChild(imagenDIV)
    }

    // Agrega un boton al final para agregar mas imagenes
    const botonAgregarImagen = document.createElement('button')
    botonAgregarImagen.id="caracteristicas__agregarImagen"
    botonAgregarImagen.className="botonRegistener2"
    botonAgregarImagen.textContent="+"
    botonAgregarImagen.onclick=(event)=>{
        event.preventDefault()
        ventanaEmergenteCargarImagenProducto(-1)
    }
    fragmento.appendChild(botonAgregarImagen)

    // Agrega los elementos al DOM
    contenedorImagenes.appendChild(fragmento)

}

const cargarProductoDOM =()=>{
    const categoriaCompleta = categorias!.find(categoria=>categoria._id===productoVentanaModificar!.categoria)

    // Coloca la informacion en los inputs correspondientes
    id.value = productoVentanaModificar!._id.toString();
    nombre.value = productoVentanaModificar!.nombre==="Sin nombre"?'':productoVentanaModificar!.nombre;
    precio.value = `${productoVentanaModificar!.precio===0?'':productoVentanaModificar!.precio}`;
    marca.value = productoVentanaModificar!.marca==="Sin marca"?'':productoVentanaModificar!.marca;
    modelo.value = productoVentanaModificar!.modelo==="Sin modelo"?'':productoVentanaModificar!.modelo;
    if(categoriaCompleta) categoria.value = categoriaCompleta.nombre
    else categoria.value = "Seleccione una categoria"
    descripcion.textContent = productoVentanaModificar!.descripcion;
}

const validarCaracteristicasDOM = async(datosFormulario:FormData)=>{

    // Si el usuario ingreso una nueva categoria entonces la agrega
    const categoriaNueva:string|undefined = categoriaIngresada.value
    if (categoriaNueva) {
        const categoriaNuevaCompleta = await solicitudAgregarCategoria(categoriaNueva) // La agrega a la base de datos
        if(categoriaNuevaCompleta) {
            categorias?.push(categoriaNuevaCompleta) // Si todo sale bien agrega la nueva categoria a la lista de categorias dentro del programa
            datosFormulario.set('categoria',categoriaNueva) // Agrega la categoria al FormData para enviarlo junto con la demas informacion del producto
            
            // Vuelve a cargar las categorias para reflejar los cambios TODO la categoria no aparece hasta recien que se actualiza la pagina, lo cual es un error
            buscarCargarCategorias(contenedorCategorias,contenedorOpcionesCategorias) 
        }
    }
    // Verifica que no esten vacias
    if(!nombre.value) nombre.classList.add('boton__enError')
    if(!precio.value) precio.classList.add('boton__enError')
    if(!marca.value) marca.classList.add('boton__enError')
    if(!modelo.value) modelo.classList.add('boton__enError')
    if(categoria.value==="Seleccione una categoria") categoria.classList.add('boton__enError')

}

// Variantes
export const cargarVariantesDOM=async() =>{


    contenedorVariantes.innerHTML=''; // Vacia el contenedor con informacion previa
    
    // Agrega el mensaje de "sin variantes" para activarlo dado el caso
    const contenedorMensaje = document.createElement('div')
    contenedorMensaje.id='ventana__modProd__modVar__vacio';

    contenedorMensaje.textContent='No hay ninguna variante para mostrar'
    contenedorVariantes.appendChild(contenedorMensaje)

    // Carga las distintas variables del producto, si existen
    if(productoVentanaModificar!.variantes.length>0){ // Carga las variantes del producto
        (productoVentanaModificar!.variantes as variante[]).forEach(variante => {
            agregarVarianteDOM(contenedorVariantes,variante)
        });
        contenedorMensaje.className="noActivo" // Desactiva el mensaje de "sin variantes"
    }

}

export const agregarVarianteDOM =(contenedor:HTMLElement,variante:variante)=>{

    // Agrega la variante al DOM
    const contenedorVariante = document.createElement('div') // Contenedor de la variante
    if(variante._id) contenedorVariante.id = variante._id.toString() // Si la variante existe en la base de datos deberia tener un id, asi que id del contenedor es el mismo id que el de la variante
    contenedorVariante.classList.add('ventana__modProd__modVar__variantes__div');

    let opcionesColores:string = `
    <option>Rojo</option>
    <option>Naranja</option>
    <option>Azul</option>
    <option>Verde</option>
    <option>Negro</option>
    <option>Blanco</option>
    <option>Amarillo</option>
    <option>Gris</option>
    <option>Rosa</option>
    <option>Marrón</option>
    <option>Celeste</option>
    <option>Violeta</option>
    `

    // Define cual es el color seleccionado
    opcionesColores = opcionesColores.replace(`>${variante.color}`,` selected>${variante.color}`)
    contenedorVariante.innerHTML=`
        <input  placeholder="Ingrese un SKU" class="inputRegistener1 ventana__modProd__modVar__input-SKU" value="${variante.SKU}">
        <select class="inputRegistener1 ventana__modProd__modVar__select-color" name="color"> ${opcionesColores}</select>
        <input class="inputRegistener1 ventana__modProd__modVar__input-talle" value="${variante.talle}">
        <input placeholder="0" class="inputRegistener1 ventana__modProd__modVar__input-stock" value="${variante.stock}"  type="number">
    `

    // Crea el boton para eliminar la variante
    const botonEliminarVariante = document.createElement('button')
    botonEliminarVariante.innerHTML=`<i class="fa-solid fa-trash"></i>`
    botonEliminarVariante.className="botonRegistener3 variante__eliminar boton__negativo" 
    botonEliminarVariante.onclick=async()=>{
        const varianteId:string|undefined = botonEliminarVariante.parentElement!.id;
        if(!varianteId) botonEliminarVariante.parentElement!.className="noActivo"; // Si la variante no esta en la base de datos simplemente la oculta en el DOM
        else{ // Si esta en la base de datos se envia una solicitud al servidor
            const respuesta = await eliminarVariante(varianteId);
            if(respuesta===0) botonEliminarVariante.parentElement!.classList.add('noActivo'); // Si la variante se elimino de forma exitosa oculta la variante
        
        }
        // Verifica si existen mas especificaciones, si no existen mas activa el mensaje la advertencia de que no hay especificaciones
        const contenedoresVariantes = document.querySelectorAll(".ventana__modProd__modVar__variantes__div")
        if(contenedoresVariantes.length<1) document.getElementById("ventana__modProd__modVar__vacio")!.classList.remove('noActivo')
    }

    
    contenedorVariante.appendChild(botonEliminarVariante) // Agrega el boton al contenedor
    contenedor.appendChild(contenedorVariante) // Agrega el contenedor al DOM
    

    document.getElementById('ventana__modProd__modVar__vacio')!.classList.add('noActivo') // Si el mensaje de "sin variantes" esta activo entonces lo desactiva
}

const obtenerVariantesDOM =(productoID:string):variante[]=>{
    // Devuelve un array con todas las variantes del producto que se encuetran en el DOM

    // Inicializa la variable que almacena todas las variantes del producto, el indice de los colores dentro de la variable "variantes" y "arrayColoresVariables" comparten el mismo orden
    let variantes:variante[]=[]

    const contenedoresventana__modProd__modVar = document.querySelectorAll('.ventana__modProd__modVar__variantes__div') as NodeListOf<HTMLDivElement> // Almacena todos los contenedores de las variantes del producto

    // Recorre todos los contenedores de variantes de un producto
    contenedoresventana__modProd__modVar.forEach(contenedorVariante=>{


        const SKU:string = (contenedorVariante.querySelector('.ventana__modProd__modVar__input-SKU')! as HTMLInputElement).value
        const color:string = (contenedorVariante.querySelector('.ventana__modProd__modVar__select-color')! as HTMLSelectElement).value
        const talle:string = (contenedorVariante.querySelector('.ventana__modProd__modVar__input-talle')! as HTMLInputElement).value
        const stock:number = Number((contenedorVariante.querySelector('.ventana__modProd__modVar__input-stock')! as HTMLInputElement).value)

        const varianteNueva:variante={
            producto:productoID,
            _id:contenedorVariante.id,
            SKU,
            color,
            talle,
            stock,
            'esFavorito':false,
            usuario:usuarioInformacion!._id
        }

        // Agrega las nueva variante
        variantes.push(varianteNueva) // Si el array de variantes no esta vacio entonces agrega la nueva variante
    })
    return variantes
}

const validarVariantesDOM =async(productoId:string)=>{
    // Verifica las variantes

    const variantes = obtenerVariantesDOM(productoId) // Devuelve las variantes que hay en el DOM
    if(variantes.length<1) { // Verifica que exista al menos una variante
        contenedorVariantes.classList.add('boton__enError')
        return 
    }
    

    // Si hay almenos una variante entonces la envia al servidor para ser guardada
    const errores = await actualizarVariantes(variantes,productoId)
    if(!errores) return // Si no hay errores entonces entonces termina la ejecucion de la funcion

    // Marca en error los inputs correspondientes.
    errores.forEach(error=>{
        const contenedorVarianteEnError = document.getElementById(`${error.value}`)
        if(error.path==='SKU') contenedorVarianteEnError?.querySelector('.ventana__modProd__modVar__input-SKU')!.classList.add('boton__enError')
        if(error.path==='stock') contenedorVarianteEnError?.querySelector('.ventana__modProd__modVar__input-stock')!.classList.add('boton__enError')
    })
}

// Especificaciones
const cargarEspecificacionesDOM =()=>{
    
    contenedorEspecificaciones.innerHTML=''; // Vacia el contenedor con informacion previa

    // Contenedor del mensaje de "sin especificaciones" para mostrarlo dado el caso
    const contenedorMensaje = document.createElement('div')
    contenedorMensaje.id='ventana__modProd__modEspecif__especificaciones__vacio';
    contenedorMensaje.textContent='No hay ninguna especificacion para mostrar'
    contenedorEspecificaciones.appendChild(contenedorMensaje)
    
    // Carga las distintas variables del producto, si existen
    if(productoVentanaModificar!.especificaciones.length>0){ // Carga las variantes del producto
        productoVentanaModificar!.especificaciones.forEach(especificacion => {
            agregarEspecificacionDOM(especificacion)
        });
        contenedorMensaje.className="noActivo" // Desactiva el mensaje de "sin especificaciones"
    }


}

const agregarEspecificacionDOM=(especificacion:EspecificacionI)=>{
    // Agrega la especificacion al DOM
    const contenedorEspecificacion = document.createElement('div') // Contenedor de la variante
    contenedorEspecificacion.classList.add('ventana__modProd__modEspecif__especificacion');

    contenedorEspecificacion.innerHTML=`
        <input placeholder="Ingrese un nombre" class="inputRegistener1 especificacion__input-nombre" value='${especificacion.nombre?especificacion.nombre:''}'>
        <input placeholder="Ingrese una descripcion" class="inputRegistener1 especificacion__input-descripcion" value='${especificacion.descripcion?especificacion.descripcion:''}'>
    `

    // Boton para eliminar una especificacion
    const botonEliminarEspecificacion = document.createElement('button')
    botonEliminarEspecificacion.innerHTML=`<i class="fa-solid fa-trash-can"></i>`
    botonEliminarEspecificacion.className="botonRegistener3 especificacion__eliminar boton__negativo" 
    botonEliminarEspecificacion.onclick=()=>{
        botonEliminarEspecificacion.parentElement!.classList.add('noActivo')
        botonEliminarEspecificacion.parentElement!.classList.remove('ventana__modProd__modEspecif__especificacion')

        // Verifica si existen mas especificaciones, si no existen mas activa el mensaje la advertencia de que no hay especificaciones
        const contenedoresEspecificaciones = document.querySelectorAll(".ventana__modProd__modEspecif__especificacion")
        if(contenedoresEspecificaciones.length<1) document.getElementById("ventana__modProd__modEspecif__especificaciones__vacio")!.classList.remove('noActivo')
    }

    contenedorEspecificacion.appendChild(botonEliminarEspecificacion) // Agrega el boton al contenedor de la especificacion
    contenedorEspecificaciones.appendChild(contenedorEspecificacion) // Agrega la especificacion al DOM

    document.getElementById('ventana__modProd__modEspecif__especificaciones__vacio')?.classList.add('noActivo') // Si el mensaje de "sin variantes" esta activo entonces lo desactiva
}

const obtenerEspecificacionesDOM=()=>{
    // Devuelve un array con todas las especificaciones del producto que se encuentren en el DOM

    // Inicializa la variable que almacena todas las especificaciones del producto
    let especificaciones:EspecificacionI[]=[]

    const contenedoresventana__modProd__modEspecif = document.querySelectorAll('.ventana__modProd__modEspecif__especificacion') as NodeListOf<HTMLDivElement> // Almacena todos los contenedores de las variantes del producto

    // Recorre todos los contenedores de variantes de un producto
    contenedoresventana__modProd__modEspecif.forEach(contenedorEspecificacion=>{


        const nombre:string = (contenedorEspecificacion.querySelector('.especificacion__input-nombre')! as HTMLInputElement).value
        const descripcion:string = (contenedorEspecificacion.querySelector('.especificacion__input-descripcion')! as HTMLSelectElement).value

        const especificacion:EspecificacionI={
            nombre,
            descripcion
        }

        // Agrega las nueva especificacion
        especificaciones.push(especificacion) 
        
    })
    return especificaciones
}

// Carga los botones de la ventana

export const cargarVentanaModificarProducto=()=>{
    asignaBotonAgregarVariante()
    asignaBotonAgregarEspecificacion()
    asignaInputsInfoProducto()
}

const asignaBotonAgregarVariante=()=>{
    // Carga la funcion de agregar variante en la ventana de variantes de producto
    botonAgregarVariante.onclick=async(event)=>{
        event.preventDefault()
        contenedorVariantes.classList.remove('boton__enError') // Remueve el estado de error del contenedor de las variantes, si existe
        
        // Crea una variable nueva con variables por default
        let varianteNueva:variante = {
            producto: productoVentanaModificar!._id,
            color: '',
            talle: '',
            SKU: (new Date().getTime()).toString(), // Crea un SKU por default, el usuario luego puede definir uno diferente
            stock: 0,
            'esFavorito':false,
            usuario:usuarioInformacion!._id
        }

        agregarVarianteDOM(contenedorVariantes,varianteNueva) // Crea la variante en el DOM
        
    }

}

const asignaBotonAgregarEspecificacion=()=>{
    // Carga la funcion de agregar una especificacion en la ventana de especificaciones de producto
    botonAgregarEspecificacion.onclick=async(event)=>{
        event.preventDefault()

        // Crea una nueva especificacion por default
        let especificacionNueva:EspecificacionI = {
            nombre:'',
            descripcion:''
        }
        agregarEspecificacionDOM(especificacionNueva)
    }
}

const asignaInputsInfoProducto=()=>{
    // Elimina el estado de error de los inputs a los cuales se les hace click
    const inputsInfoProducto = document.querySelectorAll('.ventana__modProd__caracteristicas__input') as NodeListOf<HTMLInputElement>
    inputsInfoProducto.forEach(input=>input.addEventListener('click',()=>input.classList.remove('boton__enError')))
}
