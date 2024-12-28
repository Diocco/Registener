import { Request, Response } from 'express';
import { usuario } from '../models/interfaces/usuario.js';
import { RegistroVentaI } from '../models/interfaces/registroVentas.js';
import VentaRegistro from '../models/registroVenta.js';
import { error } from '../interfaces/error.js';
import mongoose from 'mongoose';
import { ElementoCarritoI } from '../interfaces/elementoCarrito.js';


export const registrarVenta = async(req: Request, res: Response) =>{
    // Desestructura la informacion del body para utilizar solo la informacion requerida
    // Previamente se verifico la existencia de los elementos obligatorios y el formato correcto de la totalidad de los elementos
    const { lugarVenta, 
        fechaVenta,
        total,
        metodo1,
        metodo2,
        etiqueta,
        pago1,
        pago2,
        descuento,
        descuentoNombre,
        promocion,
        observacion,
        cliente,
        carrito,
        vendedor,
        estado,
        modificaciones
    } = req.body

    const usuario:usuario = req.body.usuario
    
    let data:RegistroVentaI={ // Estructura la informacion obligatoria para realizar la solicitud
        fechaVenta,
        total,
        metodo1,
        estado,
        etiqueta
    }

    try{
        // Verifica la informacion opcional, si existe la agrega a la informacion de la solicitud
        if(pago1) data.pago1=pago1
        if(pago2) data.pago2=pago2
        if(metodo2) data.metodo2=metodo2
        if(lugarVenta) data.lugarVenta=lugarVenta
        data.descuento=descuento||0;
        data.descuentoNombre=descuentoNombre||'Descuento sin nombre'
        if(promocion) data.promocion=promocion
        if(observacion) data.observacion=observacion
        if(cliente) data.cliente=cliente
        if(carrito) data.carrito=carrito
        if(vendedor) data.vendedor=vendedor
        if(modificaciones) data.modificaciones=modificaciones

        const registroVenta = new VentaRegistro( data ) // Crea una nuevo registro de venta
        await registroVenta.save() // La guarda en la base de datos
        res.json(registroVenta)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al crear el registro de la venta",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

export const verRegistroVentas = async(req: Request, res: Response)=>{

    // Si se envian queryparams entonces se buscan todos los productos filtrados por los parametros recibidos
    const desde:number = Math.abs(Number(req.query.desde)) || 0;  // Valor por defecto 0 si no se pasa el parámetro o es invalido
    const cantidadElementos:number = Math.abs(Number(req.query.cantidadElementos)) || 20;  // Valor por defecto 20 para mostrar los elementos en varias paginas
    const fechaDesde = req.query.fechaDesde as string||'0';  
    const fechaHasta = req.query.fechaHasta as string|| new Date().toString();  
    const pagina:number = Math.abs(Number(req.query.pagina)) || 1;  // Valor que indica la pagina de los resultados

    // Si se envio un ID como parametro verifica que sea valido, si no es valido entonces coloca un id valido pero que no exista. Si no se envio un ID como parametro entonces deja el campo en undefined
    const IDVenta:string|undefined = req.query.IDVenta? (mongoose.Types.ObjectId.isValid(req.query.IDVenta as string)?req.query.IDVenta as string:"000000000000000000000000")
                                                        :undefined;  

    const metodo1:string|undefined = req.query.metodo1 as string || undefined // Valor que filtra por metodo de pago

    const estadosString = req.query.estados as string // Valor que filtra por estado de la venta
    let estados:string[] = []
    estados = estadosString.split(',') // Crea un array de los string con los estados que se quieren filtrar separados por comas


    const buscarObservacion:RegExp|undefined = req.query.buscarObservacion? new RegExp(req.query.buscarObservacion as string, 'i'): undefined; // Palabra buscada dentro de las observaciones

    try{
        let filtros: any = {
            // Los filtros opcionales donde el valor buscado puede estar en varias propiedades
            $or: [{ vacio:undefined }],
            $and: [
                { fechaVenta: { $gte: new Date(fechaDesde), $lte: new Date(fechaHasta)  } },  // Rango de precios
                { vacio:undefined }
                // { metodo1:metodo1||'' }
            ]
        };

        if(estados.length>0) filtros.$and.push({ estado: {$in:estados} })
        if(buscarObservacion) filtros.$and.push({ observacion:  buscarObservacion })
        if(IDVenta) filtros.$and.push({ _id: IDVenta})



        // Crea un array de promesas que no son independientes entre ellas para procesarlas en paralelo
        const [registroVentas, registroVentasCantidad]:[RegistroVentaI[],number] = await Promise.all([ // Una vez que se cumplen todas se devuelve un array con sus resultados
            VentaRegistro.find(filtros)  // Busca a todos los productos en la base de datos que cumplen la condiciones
                .select('_id etiqueta fechaVenta total metodo1 metodo2 estado observacion') // Indica los elementos que se requieren y descarta los demas
                .skip(desde+((pagina-1)*cantidadElementos)).sort({fechaVenta:-1}).limit(cantidadElementos),
            VentaRegistro.countDocuments(filtros) // Devuelve la cantidad de objetos que hay que cumplen con la condiciones
        ])
        // Indica la cantidad de paginas que se necesitan para mostrar todos los resultados
        const paginasCantidad:number = Math.ceil(registroVentasCantidad/cantidadElementos); 



        res.status(200).json({
            registroVentas,
            registroVentasCantidad,
            paginasCantidad
        })
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver los productos",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

export const verRegistro = async(req: Request, res: Response)=>{
    const { id } = req.params
    try{
        const producto = await VentaRegistro.findById(id)
        res.status(200).json(producto)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al ver el registro",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

export const modificarRegistro= async(req: Request, res: Response)=>{
    let { id,
        lugarVenta,
        fechaVenta,
        total,
        metodo1,
        metodo2,
        pago1,
        pago2,
        descuentoNombre,
        descuento,
        promocion,
        observacion,
        cliente,
        carrito,
        vendedor,
        usuario } = req.body

        const usuarioNombre = (usuario as usuario).nombre 
        const fecha = new Date()

        try {
            const registro = (await VentaRegistro.findById(id))! /* Se busca el registro */

            /* Aplica las modificaciones */
            /* Lugar de la venta */
            if(lugarVenta&&registro.lugarVenta!==lugarVenta){
                const modificacion = registro.lugarVenta?`Se cambio el lugar de venta de "${registro.lugarVenta}" a "${lugarVenta}"`:`Se agrego el lugar de venta: ${lugarVenta}`
                registro.lugarVenta=lugarVenta
                registro.modificaciones?.push({fecha,usuarioNombre,modificacion})
            }
            /* Fecha y hora de la venta */
            const fechaVentaString = new Date(fechaVenta).toLocaleString('es-AR')
            const fechaVentaRegistroString = new Date(registro.fechaVenta).toLocaleString('es-AR')
            if(fechaVentaString&&fechaVentaRegistroString!==fechaVentaString){
                const modificacion = registro.fechaVenta?`Se cambio la fecha de la de venta de "${fechaVentaRegistroString}" a "${fechaVentaString}"`:`Se agrego la hora de venta: ${fechaVentaString}`
                registro.fechaVenta=fechaVenta
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Precio total de la venta */
            total = Number(total)
            if(total&&registro.total!==total){
                const modificacion = registro.total?`Se cambio el total de "${registro.total}" a "${total}"`:`Se agrego el total de la venta: ${total}`
                registro.total=total
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Primer medio de pago de la venta */
            if(metodo1&&registro.metodo1!==metodo1){
                const modificacion = registro.metodo1?`Se cambio el primer metodo de pago de "${registro.metodo1}" a "${metodo1}"`:`Se agrego el primer metodo de pago: ${metodo1}`
                registro.metodo1=metodo1
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Segundo medio de pago de la venta */
            if(metodo2&&registro.metodo2!==metodo2){
                const modificacion = registro.metodo2?`Se cambio el segundo metodo de pago de "${registro.metodo2}" a "${metodo2}"`:`Se agrego el segundo metodo de pago: ${metodo2}`
                registro.metodo2=metodo2
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Pago con el primer metodo de pago */
            pago1 = Number(pago1)
            if(pago1&&registro.pago1!==pago1){
                const modificacion = registro.pago1?`Se cambio el pago del primer metodo de pago de "${registro.pago1}" a "${pago1}"`:`Se agrego el pago del primer metodo de pago: ${pago1}`
                registro.pago1=pago1
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Pago con el segundo metodo de pago */
            pago2 = Number(pago2)
            if(pago2&&registro.pago2!==pago2){
                const modificacion = registro.pago2?`Se cambio el pago del primer metodo de pago de "${registro.pago2}" a "${pago2}"`:`Se agrego el pago del primer metodo de pago: ${pago2}`
                registro.pago2=pago2
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Descuento de la venta */
            descuento = Number(descuento)
            if(descuento&&registro.descuento!==descuento){
                const modificacion = registro.descuento?`Se cambio el descuento de la venta "${registro.descuento}" a "${descuento}"`:`Se agrego un descuento a la venta: ${descuento}`
                registro.descuento=descuento
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Nombre del decuento de la venta */
            if(descuentoNombre&&registro.descuentoNombre!==descuentoNombre){
                const modificacion = registro.descuentoNombre?`Se cambio el descuento de la venta "${registro.descuentoNombre}" a "${descuentoNombre}"`:`Se agrego un descuento a la venta: ${descuentoNombre}`
                registro.descuentoNombre=descuentoNombre
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Observacion de la venta */
            if(observacion&&registro.observacion!==observacion){
                const modificacion = registro.observacion?`Se cambio la observacion de "${registro.observacion}" a "${observacion}"`:`Se agrego una observacion: ${observacion}`
                registro.observacion=observacion
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Cliente de la venta */
            if(cliente&&registro.cliente!==cliente){
                const modificacion = registro.cliente?`Se cambio el cliente de la venta de "${registro.cliente}" a "${cliente}"`:`Se agrego el cliente a la venta: ${cliente}`
                registro.cliente=cliente
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Carrito de la venta */
            let registroCarritoSinID:ElementoCarritoI[]|string = registro.carrito!.map(carritoConID => {// Le quita el ID para realizar la comparacion ya que los objetos de entrada no poseen ID
                const { SKU,precio,cantidad,nombre } = carritoConID; // Extrae _id y crea un nuevo objeto sin esa propiedad
                const carritoSinID:ElementoCarritoI={
                    SKU,
                    cantidad,
                    precio,
                    nombre
                }
                return carritoSinID; // Devuelve el objeto sin _id
            });
            registroCarritoSinID = JSON.stringify(registroCarritoSinID) // Lo convierte en un string para realizar la comparacion
            if(carrito&&registroCarritoSinID!=carrito){
                const modificacion = registro.carrito?`Se modifico el carrito`:`Se agrego el carrito a la venta`
                registro.carrito=JSON.parse(carrito)
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }
            /* Nombre del descuento de la venta */
            if(vendedor&&registro.vendedor!==vendedor){
                const modificacion = registro.vendedor?`Se cambio el vendedor de la venta de "${registro.vendedor}" a "${vendedor}"`:`Se agrego el vendedor a la venta: ${vendedor}`
                registro.vendedor=vendedor
                registro.modificaciones?.unshift({fecha,usuarioNombre,modificacion})
            }

            /* Refleja el estado modificado del registro */
            if(registro.modificaciones!.length>0&&registro.estado!=="Anulado") registro.estado= "Modificado"
            /* Guarda los cambios en la base de datos */
            registro.save()

            res.json(registro)

        } catch (error) {
            const errors:error[]=[{
                msg: "Error al modificar el registro",
                path: "Servidor",
                value: (error as Error).message
            }]
            console.log(error)
            return res.status(500).json(errors)
        }
}

export const verIngresos = async(req: Request, res: Response)=>{

    // Define la busqueda para registros que vayan desde la fecha pasada como parametro hasta la fecha actual, y que no esten anulados
    const { fechaDesde } = req.params;  
    const estados:string[] = ["Modificado","Exitoso"] // Valor que filtra por estado de la venta

    try{
        const filtros = {
            $and: [
                { fechaVenta: { $gte: fechaDesde }},  // Rango de precios
                { estado: {$in:estados} }
            ]
        };

        // Realiza la busqueda
        const registroVentas = await VentaRegistro.find(filtros)  // Busca a todos los productos en la base de datos que cumplen la condiciones
                                                .select('pago1 pago2 metodo1 metodo2') // Indica los elementos que se requieren y descarta los demas


        if(registroVentas.length<1) return res.status(200).json({ingresos:undefined}) // Si no se encontraron registros entonces devuelve undefined

        // Obtiene todos los metodos de pago
        const metodosPagoSet:Set<string> = new Set 
        registroVentas.forEach(registro => {
            metodosPagoSet.add(registro.metodo1)
            if(registro.metodo2) metodosPagoSet.add(registro.metodo2)
        });
        const metodosPago = Array.from(metodosPagoSet);


        // Inicializa el array de objetos que contendran los ingresos por metodo de pago
        let ingresos:[{
            metodo:string,
            monto:number
        }] = [{
            metodo:'Vacio',
            monto:0
        }]

        for (let i = 0; i < metodosPago.length; i++) {
            const nuevoMetodo = {
                metodo:metodosPago[i],
                monto:0
            }
            ingresos[i] = nuevoMetodo
        }

        // Calcula el monto ingresado de cada medio de pago
        registroVentas.forEach(registro=>{
            // Primer metodo de pago
            let metodo = ingresos.find(m => m.metodo === registro.metodo1)! // Busca el objeto que tenga como nombre el metodo de pago
            metodo.monto = metodo.monto + (registro.pago1 || 0) // Agrega el monto

            // Segundo metodo de pago
            if(registro.metodo2){
                metodo = ingresos.find(m => m.metodo === registro.metodo2)! 
                metodo.monto = metodo.monto + (registro.pago2 || 0)
            }
        })

        res.status(200).json({ingresos})

    } catch (error) {
        const errors:error[]=[{
            msg: "Error al calcular los ingresos por metodo de pago",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}

// Elimina un registro de venta con el id pasado como parametro
export const eliminarRegistroVenta = async(req: Request, res: Response) =>{

    const {registroVentaID} = req.params; // Desestructura el id

    try{
        // Busca la registro con ese id y cambia su estado de actividad
        const registroAnulado = await VentaRegistro.findByIdAndUpdate( registroVentaID , {estado: "Anulado"}, { new: true }); 
        res.status(200).json(registroAnulado)
    } catch (error) {
        const errors:error[]=[{
            msg: "Error al eliminar el registro",
            path: "Servidor",
            value: (error as Error).message
        }]
        console.log(error)
        return res.status(500).json(errors)
    }
}