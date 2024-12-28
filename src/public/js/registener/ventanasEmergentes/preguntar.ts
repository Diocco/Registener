//Ventana emergentes para confirmaciones del usuario o errores
export const preguntar = async(mensajeTexto:string):Promise<boolean> => {
    let mensaje:HTMLElement=document.getElementById("ventanaEmergente__mensaje")!;
    let fondo:HTMLElement=document.getElementById("ventanaEmergenteFondo")!
    let botonAceptar:HTMLElement=document.getElementById("ventanaEmergente__aceptar__boton")!;
    let botonRechazar:HTMLElement=document.getElementById("ventanaEmergente__rechazar__boton")!;
    let ventanaEmergente:HTMLElement=document.getElementById("ventanaEmergente")!;

    // Define el mensaje de la ventana emergente
    mensaje.textContent=mensajeTexto

    // Activa la ventana emergente
    ventanaEmergente.classList.remove('noActivo')
    const esFondoActivo:boolean = !(fondo.classList.contains('noActivo')) // Verifica si previamente el fondo estaba activo
    if(!esFondoActivo) fondo.classList.remove('noActivo') // Si el fondo estaba activo entonces no realiza cambios
    

    return new Promise<boolean>((resolve) => {
        botonAceptar.onclick=()=>{
            // Desactiva la ventana emergente
            ventanaEmergente.classList.add('noActivo')
            if(!esFondoActivo) fondo.classList.add('noActivo') // Si el fondo estaba activo entonces no realiza cambios
            resolve(true)
        }
        botonRechazar.onclick=()=>{
            // Desactiva la ventana emergente
            ventanaEmergente.classList.add('noActivo')
            if(!esFondoActivo) fondo.classList.add('noActivo') // Si el fondo estaba activo entonces no realiza cambios
            resolve(false)
        }
    })

}
