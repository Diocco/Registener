
import { producto } from "../../../models/interfaces/producto.js";
import { variante } from "../../../models/interfaces/variante.js";
import { mostrarMensaje } from "../helpers/mostrarMensaje.js";
import { actualizarProducto } from "../services/productosAPI.js";





export const agregarProductosDOM = async(productos:producto[],contenedorProductos:HTMLElement) => {

    if(productos.length<1){ // Si no se encontraron productos da aviso al usuario
        // Vacia el contenedor y muestra un mensaje de error
        contenedorProductos.innerHTML=`
        <div id="configProductos__productos__vacio">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>No se encontraron productos para los parametros de busqueda</p>
        </div>
        `
        return 
    }

    new Promise<void>((resolve) => {
        contenedorProductos.innerHTML=''; // Reinicia el contenedor
        const fragmento: DocumentFragment = document.createDocumentFragment(); //Crea un fragmento para alojar todos los elementos antes de agregarlos al catalogo
    

        productos.forEach((producto) => { // Recorre los productos
            let agregarElemento = document.createElement('div'); // Crea un div para alojar el nuevo producto

            // Calcula el stock total del producto
            let stockTotal:number=0;
            if(producto.variantes){
                (producto.variantes as variante[]).forEach(variante => {
                    stockTotal=stockTotal+variante.stock
                })
            }else{
                mostrarMensaje('No se pudo calcular el stock de un producto',true)
                console.error(`No se pudo calcular el stock del producto: ${producto.nombre}, ya que no tiene ninguna variante, por favor asignarle una`  )
            }
            
            agregarElemento.id=producto._id.toString()
            agregarElemento.className="contenedorRegistener3 configProductos__producto"
            
            let claseProductoDisponible = 'boton__activo'
            if (producto.disponible===false) claseProductoDisponible='' // Si el producto no esta disponible entonces no coloca ninguna clase

            agregarElemento.innerHTML=` 
            <div>${producto.nombre}</div>
            <div>$ ${(Number(producto.precio)).toLocaleString('es-AR')}</div>
            <div class="configProductos__producto-stock">${stockTotal}</div>
            <div class="configProductos__producto-opciones">
                <button class="fa-solid fa-eye       producto__opciones botonRegistener3 producto__disponibilidad ${claseProductoDisponible}" ></button>
                <button class="fa-solid fa-trash-can producto__opciones botonRegistener3 producto__eliminar       boton__negativo             " ></button>
            </div>
            `
            
            fragmento.appendChild(agregarElemento); //Agrega el producto recien creado al fragmento
    
        })
        contenedorProductos.appendChild(fragmento); //Agrega el fragmento con todos los productos al catalogo
        resolve()
    })

}


export const alternarDisponibilidadProducto =async (idProducto:string,estaDisponible:boolean,boton:HTMLElement)=>{
    // Realiza la peticion PUT para modificar el producto
    const formData = new FormData
    formData.append('disponible',JSON.stringify(!estaDisponible))
    const productoActualizado = await actualizarProducto(formData,idProducto)
    if(productoActualizado) boton.classList.toggle('boton__activo') // Alterna visualmente la disponibilidad del producto para reflejar los cambios efectuados
}





