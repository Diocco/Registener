import { producto } from "../../../models/interfaces/producto.js";
import { variante } from "../../../models/interfaces/variante.js";

export const agregarProductosDOM = (productos:producto[],contenedorProductos:HTMLElement) => {


    new Promise<void>((resolve) => {
        contenedorProductos.classList.remove('catalogo-conMensaje') // Elimina el mensaje de "sin productos"
        contenedorProductos.innerHTML=''; // Reinicia el contenedor
        const fragmento: DocumentFragment = document.createDocumentFragment(); //Crea un fragmento para alojar todos los elementos antes de agregarlos al catalogo
    
    
        productos.forEach((producto) => { // Recorre los productos
            let agregarElemento = document.createElement('div'); // Crea un div para alojar el nuevo producto
            // Verifica que exista una imagen, sino muestra un icono de error
            const imagenProducto = producto.imagenes[0]?producto.imagenes[0]:'../img/icons/sinFoto.webp' 
            const tieneDescuento:boolean = producto.precioViejo?true:false
            
            // Verifica que exista al menos una variante, y si existe refleja sus caracteristicas
            const coloresUnicos: Set<string> = new Set(); // Usamos un Set para almacenar colores únicos
            let coloresHTML:string='' // Prepara el HTML con los colores para luego cargarlo junto al producto
            if(producto.variantes){ // Si el producto tiene variantes entonces refleja sus caracteristicas
                (producto.variantes as variante[]).forEach(variante => {
                    // Agregar el color al Set de colores únicos
                    coloresUnicos.add(variante.color);
                });
        
                // Convertir los Sets a arrays 
                const coloresArray = Array.from(coloresUnicos);
        
                // Recorre el array de colores
                coloresArray.forEach(color=>{
                    const colorHTML = `<div class="catalogo__div__color ${color}" ></div>`
                    coloresHTML=coloresHTML+colorHTML
                })
            }
    
            
            agregarElemento.id=producto._id.toString()
            agregarElemento.classList.add("catalogo__div")
            
            if(tieneDescuento){
                const precio = (Number(producto.precio))
                const precioViejo = (Number(producto.precioViejo))
                const porcentajeDescuento = Math.floor((1-precio/precioViejo)*100)
                agregarElemento.innerHTML=`
                <div class="catalogo__div__imagen imagenProducto" style='background-image: url("${imagenProducto}');">${coloresHTML}</div>
                <h2 class="catalogo__div__nombre">${producto.nombre}</h2>
                <div class="catalogo__div__descuento">
                    <h3 class="descuento__precioViejo">$ ${(Number(producto.precioViejo)).toLocaleString('es-AR')}</h3>
                    <h3 class="descuento__porcentaje"> ${porcentajeDescuento}% OFF!</h3>
                </div>
                <h3 class="catalogo__div__precio">$ ${precio.toLocaleString('es-AR')}</h3>
                `;
            }else{
                agregarElemento.innerHTML=`
                <div class="catalogo__div__imagen" style='background-image: url("${imagenProducto}');">${coloresHTML}</div>
                <h2 class="catalogo__div__nombre">${producto.nombre}</h2>
                <div class="catalogo__div__descuento"></div>
                <h3 class="catalogo__div__precio">$ ${(Number(producto.precio)).toLocaleString('es-AR')}</h3>
                `;
            }
            fragmento.appendChild(agregarElemento); //Agrega el producto recien creado al fragmento
    
        })
        contenedorProductos.appendChild(fragmento); //Agrega el fragmento con todos los productos al catalogo
        resolve()
    })
    .then(()=>{
        // Una vez que se agregaron los productos al DOM
        const productos = document.querySelectorAll(".catalogo__div") // Se selecciona todos los nodos
        productos.forEach(producto =>{ // Se escucha cuando se hace click en alguno de ellos
            producto.addEventListener("click",()=>{
                location.assign(`/producto/${producto.id}`) // Reedirije al usuario a la pagina del producto en particular
            })
        })
    })
}