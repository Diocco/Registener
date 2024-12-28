
export const mostrarMensaje=(codigoMensaje:string="sc",error:boolean=false)=>{
    const contenedorGeneralMensaje:HTMLElement = document.getElementById('contenedorMensajeUsuario')! 
    const contenedorMensaje:HTMLElement = document.getElementById('mensajeUsuario')! 
    const textoMensaje:HTMLElement = document.getElementById('mensajeUsuario__p')!
    const iconoMensaje:HTMLElement = document.getElementById('mensajeUsuario__i')!
    const iconoMensajeError:HTMLElement = document.getElementById('mensajeUsuario__i-error')!

    // Si esta activo, esconde el mensaje
    contenedorGeneralMensaje.classList.remove('contenedorMensajeUsuario-activo') // Reinicia el estado de la animacion
    contenedorMensaje.classList.add('noActivo') // Oculta el mensaje
    contenedorMensaje.classList.remove('mensajeUsuario-animacionSinMensaje'); // Elimina la animacion si existe

    // Definir el icono del mensaje
    if(error){ // Si el mensaje no es un mensaje de error
        iconoMensaje.classList.add('noActivo') // Oculta el icono "chech"
        iconoMensajeError.classList.remove('noActivo') // Muestra el icono "error"
        contenedorMensaje.classList.add('mensajeUsuario-enError') // Cambia el color del fondo
    }

    if(codigoMensaje==='sc'||!codigoMensaje){ // Si no hay ningun mensaje
        // Cambia la animacion
        contenedorMensaje.classList.add('mensajeUsuario-animacionSinMensaje');
    }else{ // Si hay un mensaje entonces lo muestra
        switch (codigoMensaje) {
            case '1':
                textoMensaje.textContent='La sesion ha caducado';
                break;
            case '2':
                textoMensaje.textContent='Error del servidor';
                break;
            case '3':
                textoMensaje.textContent='Error del servidor, vuelva a iniciar sesion';
                break;
            case '4':
                textoMensaje.textContent='Usuario actualizado con exito';
                break;
            case '5':
                textoMensaje.textContent='Producto actualizado con exito';
                break
            case '6':
                textoMensaje.textContent='Imagen agregada con exito';
                break
            case 'sc':
                textoMensaje.textContent='';
                break;
            default: 
                textoMensaje.textContent=`${codigoMensaje}`;
                break;
        }
    }


    // Muestra el mensaje
    setTimeout(() => { // Se requiere un timeout ya que sino el comportamiento de retirar la clase al principio de la funcion y agregarla al final de la funcion no surten efecto
        contenedorGeneralMensaje.classList.add('contenedorMensajeUsuario-activo') // Activa la animacion
        contenedorMensaje.classList.remove('noActivo') // Muestra el mensaje
    }, 50);
}


















