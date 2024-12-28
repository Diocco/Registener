import MetodoPago from "../src/models/metodosPago.js"

export const metodoPagoNombreUnico=async (nombre:string)=>{
    const metodosPago = await MetodoPago.find()
    const metodosPagoNombre = metodosPago.map(metodopago => metodopago.nombre)
    const esNombreUnico = !metodosPagoNombre.includes(nombre)
    if(!esNombreUnico) throw new Error("El nombre ya existe");

}
export const metodoPagoTipoValido=async (tipo:string)=>{
    const tiposValidos=["Digital","Bancario","Efectivo"]
    const esTipoValido = tiposValidos.includes(tipo)
    if(!esTipoValido) throw new Error("El tipo no es valido, los tipos validos son: "+tiposValidos);
}   