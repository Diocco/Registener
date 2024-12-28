import { ElementoCarritoI } from "../../../../interfaces/elementoCarrito.js"
import { RegistroVentaI } from "../../../../models/interfaces/registroVentas.js"
import { convertirAInput } from "../../helpers/convertirElemento.js"
import { modificarRegistro, obtenerRegistro } from "../../services/registroVentasAPI.js"
import { cargarRegistrosVentaDOM } from "../registroVentas.js"

export const ventanaModificarVenta =async (IDVenta:string)=>{
    const registro = await obtenerRegistro(IDVenta)
    if(!registro) return

    // Activa la ventana emergente para modificar la venta
    document.getElementById('ventanaEmergenteFondo')!.classList.remove('noActivo')
    document.getElementById('modificarVenta')!.classList.remove('noActivo')

    cargarInformacionGeneral(registro)
    cargarCarrito(registro)
    cargarInformacionPago(registro)
    cargarModificaciones(registro)

}

const cargarInformacionPago=(registro:RegistroVentaI)=>{
    (document.getElementById('modificarVenta__infoPago__subtotal')! as HTMLDivElement).textContent=`$ ${((registro.total-(registro.descuento||0)).toLocaleString('es-AR'))}`;
    (document.getElementById('modificarVenta__infoPago__descuentoNombre')! as HTMLInputElement).value=registro.descuentoNombre||'Descuento sin nombre';
    (document.getElementById('modificarVenta__infoPago__descuento')! as HTMLInputElement).value=registro.descuento?.toString()||'0';
    (document.getElementById('modificarVenta__infoPago__total')! as HTMLDivElement).textContent=`$ ${registro.total.toLocaleString('es-AR')||'0'}`;
    (document.getElementById('modificarVenta__infoPago__metodo1')! as HTMLInputElement).value=registro.metodo1||'';
    (document.getElementById('modificarVenta__infoPago__pago1')! as HTMLInputElement).value=Number(registro.pago1).toFixed(2).toString()||Number(registro.total).toFixed(2).toString();
    (document.getElementById('modificarVenta__infoPago__metodo2')! as HTMLInputElement).value=registro.metodo2||'';
    (document.getElementById('modificarVenta__infoPago__pago2')! as HTMLInputElement).value=Number(registro.pago2).toFixed(2).toString()||'';
} 

const cargarModificaciones=(registro:RegistroVentaI)=>{
    const indice = `<div id="modificarVenta__modificaciones__indice" class="modificarVenta__modificaciones__fila">
                        <div class="modificarVenta__modificaciones__fecha">Fecha</div>
                        <div class="modificarVenta__modificaciones__usuario">Usuario</div>
                        <div class="modificarVenta__modificaciones__modificacion">Modificacion</div>
                    </div>`
    const mensajeVacio = `<div id="modificarVenta__modificaciones__mensaje">No se realizaron modificaciones</div>`

    const contenedorModificaciones = document.getElementById('modificarVenta__modificaciones')! 
    contenedorModificaciones.innerHTML=indice // Vacia el carrito

    // Llena el carrito con la informacion del registro
    const fragmento = document.createDocumentFragment()
    if(registro.modificaciones){
        if(registro.modificaciones.length<1)contenedorModificaciones.innerHTML=indice+mensajeVacio
        else{
            registro.modificaciones.forEach(modificacion=>{
                const modificacionDIV = document.createElement('div')
                modificacionDIV.className='modificarVenta__modificaciones__fila'
                modificacionDIV.innerHTML=`
                <div>${new Date(modificacion.fecha).toLocaleString('es-AR')}</div>
                <div>${modificacion.usuarioNombre}</div>
                <div>${modificacion.modificacion}</div>
                `
                fragmento.appendChild(modificacionDIV)
            })
        }
    }else{
        contenedorModificaciones.innerHTML=indice+mensajeVacio
    }

    
    contenedorModificaciones.appendChild(fragmento)


}

const cargarInformacionGeneral=(registro:RegistroVentaI)=>{
    // Le da el formato correlo a al fecha
    const fecha = new Date(registro.fechaVenta);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0'); // Agregar segundos

    // Construir la cadena con segundos: "YYYY-MM-DDTHH:MM:SS"
    const fechaLocal = `${anio}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;

    // Coloca la informacion de la venta en la ventana emergente
    document.getElementById('modificarVenta__h2')!.textContent=`ID: ${registro._id}`; // ID de la venta
    document.getElementById('modificarVenta__h3')!.textContent=`Estado: ${registro.estado}`; // Estado de la venta
    (document.getElementById('modificarVenta__infoGen__lugarVenta')! as HTMLInputElement).value=registro.lugarVenta||''; // Lugar de la venta
    (document.getElementById('modificarVenta__infoGen__fechaVenta')! as HTMLInputElement).value=fechaLocal; // Fecha de la venta
    (document.getElementById('modificarVenta__infoGen__vendedor')! as HTMLInputElement).value=registro.vendedor||''; // Vendedor 
    (document.getElementById('modificarVenta__infoGen__cliente')! as HTMLInputElement).value=registro.cliente?.toString()||''; // Cliente
    (document.getElementById('modificarVenta__infoGen__observacion')! as HTMLTextAreaElement).value=registro.observacion||''; // Obervacion
}

const cargarCarrito=(registro:RegistroVentaI)=>{

    // Coloca la informacion del carrito
    const indice = `<div id="modificarVenta__carrito__indice" class="modificarVenta__carrito__fila">
                        <div>Nombre</div>
                        <div class="modificarVenta__carrito__cantidad">Cantidad</div>
                        <div class="modificarVenta__carrito__precio">Precio</div>
                    </div>`
    const contenedorCarrito = document.getElementById('modificarVenta__carrito')! 
    contenedorCarrito.innerHTML=indice // Vacia el carrito
    
    // Llena el carrito con la informacion del registro
    if(!registro.carrito) return
    const fragmento = document.createDocumentFragment()

    for (let i = 0; i < registro.carrito.length; i++) {
        const contenedorProducto = document.createElement('div')
        contenedorProducto.className="modificarVenta__carrito__fila"
        contenedorProducto.innerHTML=`
            <div class="modificarVenta__carrito__nombre">${registro.carrito[i].nombre}</div>
            <div class="modificarVenta__carrito__cantidad">${registro.carrito[i].cantidad}</div>
            <div class="modificarVenta__carrito__precio">${registro.carrito[i].precio}</div>
        `
        contenedorProducto.id=registro.carrito[i].SKU
        fragmento.appendChild(contenedorProducto)
    }
    contenedorCarrito.appendChild(fragmento)
    cargarBotonesInput()
}

const cargarBotonesInput=()=>{
    const productosContenedores = document.querySelectorAll('.modificarVenta__carrito__fila')
    productosContenedores.forEach(productoContenedor=>{
        const elementosHijos = productoContenedor.querySelectorAll('*') as NodeListOf<HTMLDivElement>
        elementosHijos.forEach(elementoHijo=>{
            elementoHijo.onclick=()=>{
                if(elementoHijo.parentElement!.id==='modificarVenta__carrito__indice') return // Si el elemento pertenece al indice entonces no le asigna el evento
                
                let tipo = 'text'
                if(elementoHijo.className.includes('cantidad')||elementoHijo.className.includes('precio')) tipo= 'number' // Si el elemento es para asignar la cantidad o el precio el input debera ser del tipo number
                
                const elementoFinal = convertirAInput(elementoHijo,'','',tipo,true,calcularTotal)
                elementoFinal.focus()
            }
        })
    })
}

const calcularTotal=()=> {

    // Calcula el subtotal
    const elementosCarrito = document.querySelectorAll('.modificarVenta__carrito__fila')
    let subtotal = 0;
    elementosCarrito.forEach((elementoCarrito)=>{
        if(elementoCarrito.id==='modificarVenta__carrito__indice') return;
        const contenedorPrecio = elementoCarrito.querySelector('.modificarVenta__carrito__precio')! as HTMLDivElement | HTMLInputElement
        const contenedorCantidad = elementoCarrito.querySelector('.modificarVenta__carrito__cantidad')! as HTMLDivElement | HTMLInputElement
        
        let precio = Number((contenedorPrecio  as HTMLInputElement).value)

        if(isNaN(precio)) {
            precio = Number((contenedorPrecio as HTMLDivElement).textContent)
        }
        


        const cantidad = Number((contenedorCantidad as HTMLDivElement).textContent)||Number((contenedorCantidad  as HTMLInputElement).value)

        subtotal=subtotal+precio*cantidad
    })
    // Coloca el subtotal en el DOM
    document.getElementById('modificarVenta__infoPago__subtotal')!.textContent= `$ ${subtotal.toLocaleString('es-AR')}`
    
    // Suma el descuento al subtotal y lo coloca en el DOM como "total"
    const descuento = Number((document.getElementById('modificarVenta__infoPago__descuento')! as HTMLInputElement ).value)|0
    const total = subtotal+descuento
    document.getElementById('modificarVenta__infoPago__total')!.textContent= `$ ${(total).toLocaleString('es-AR')}`
    
    // Verifica que el pago realizado sea igual al total
    const contenedorPago1 = document.getElementById('modificarVenta__infoPago__pago1')! as HTMLInputElement 
    const contenedorPago2 = document.getElementById('modificarVenta__infoPago__pago2')! as HTMLInputElement 
    const pago1 = Number(contenedorPago1!.value)||0
    const pago2 = Number(contenedorPago2!.value)||0

    if(pago1+pago2!==total) {
        // Si la suma de los pagos no es igual al total agrega una advertencia
        contenedorPago1.classList.add('boton__enAdvertencia')
        if(pago2!==0) contenedorPago2.classList.add('boton__enAdvertencia')
    }else{
        // Si la suma si es igual al total entonces remueve la advertencia si existe
        contenedorPago1.classList.remove('boton__enAdvertencia')
        contenedorPago2.classList.remove('boton__enAdvertencia')
}
}

const obtenerCarritoDOM=()=>{

    let carrito:ElementoCarritoI[]=[]

    const elementosCarrito = document.querySelectorAll('.modificarVenta__carrito__fila')

    elementosCarrito.forEach((elementoCarritoDOM)=>{
        // Recorre el carrito del DOM

        const SKU = elementoCarritoDOM.id
        if(SKU==='modificarVenta__carrito__indice') return; // Si la fila es el indice pasa al siguiente elemento

        const contenedorPrecio = elementoCarritoDOM.querySelector('.modificarVenta__carrito__precio')! as HTMLDivElement | HTMLInputElement
        let precio = Number((contenedorPrecio  as HTMLInputElement).value)
        if(isNaN(precio)) {
            precio = Number((contenedorPrecio as HTMLDivElement).textContent)
        }
        
        const contenedorCantidad = elementoCarritoDOM.querySelector('.modificarVenta__carrito__cantidad')! as HTMLDivElement | HTMLInputElement
        const cantidad = Number((contenedorCantidad as HTMLDivElement).textContent)||Number((contenedorCantidad  as HTMLInputElement).value)

        const contenedorNombre = elementoCarritoDOM.querySelector('.modificarVenta__carrito__nombre')! as HTMLDivElement | HTMLInputElement
        const nombre = (contenedorNombre as HTMLInputElement).value||(contenedorNombre as HTMLDivElement).textContent||''

        // Le da el formato correcto a la informacion
        let elementoCarrito:ElementoCarritoI={
            SKU,
            cantidad,
            precio,
            nombre
        }
        
        carrito.push(elementoCarrito) // Lo agrega con el resto del elementos
    })

    return carrito
}

const cargarBotonesRespuesta=()=>{
    const botonGuardar = document.getElementById('modificarVenta__respuesta__guardar')! as HTMLButtonElement
    const botonSalir = document.getElementById('modificarVenta__respuesta__salir')! as HTMLButtonElement

    botonGuardar.addEventListener('click',async (event)=>{/* Envia la informacion para modificar el registro*/
        event.preventDefault()
        /* Obtiene la informacion general del registro y la informacion de los inputs de la informacion de pago*/
        const contenedorFormulario = document.getElementById('modificarVenta__form')! as HTMLFormElement
        const formData = new FormData(contenedorFormulario) 
        const total = (document.getElementById('modificarVenta__infoPago__total')!.textContent||'0').replace(/[^0-9]/g, '')
        formData.append('total',total)
        
        /* Obtiene el id del registro */
        const id = document.getElementById('modificarVenta__h2')!.textContent!.replace('ID: ', '')
        formData.append('id',id)

        /* Obtiene el carrito*/
        const carrito = obtenerCarritoDOM()
        formData.append("carrito",JSON.stringify(carrito))

        /* Realiza la solicitud */
        await modificarRegistro(formData)
        
        /* Refleja los resultados en el DOM*/
        cargarRegistrosVentaDOM()

        // Desactiva la ventana emergente para modificar la venta
        document.getElementById('ventanaEmergenteFondo')!.classList.add('noActivo')
        document.getElementById('modificarVenta')!.classList.add('noActivo')
    })

    botonSalir.addEventListener('click',(event)=>{
        event.preventDefault()
        // Desactiva la ventana emergente para modificar la venta
        document.getElementById('ventanaEmergenteFondo')!.classList.add('noActivo')
        document.getElementById('modificarVenta')!.classList.add('noActivo')
    })

}

const cargarInputInfoPago=()=>{
    let inputs:HTMLInputElement[] = []
    inputs.push(document.getElementById('modificarVenta__infoPago__descuento')! as HTMLInputElement) /*Descuento*/
    inputs.push(document.getElementById('modificarVenta__infoPago__pago1')! as HTMLInputElement) /*Pago 1*/
    inputs.push(document.getElementById('modificarVenta__infoPago__pago2')! as HTMLInputElement) /*Pago 2*/

    inputs.forEach(input=>input.addEventListener('input',()=>calcularTotal())) // Cada vez que se modifiquen los inputs se ejecuta la funcion para calcular nuevamente el total


}

document.addEventListener('DOMContentLoaded',()=>{
    cargarBotonesRespuesta()
    cargarInputInfoPago()
})