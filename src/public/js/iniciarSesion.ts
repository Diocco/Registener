import { error } from "../../interfaces/error.js";
import { mostrarMensaje } from "./helpers/mostrarMensaje.js";
import { solicitudIniciarSesion, solicitudRegistrarUsuario } from "./services/usuariosAPI.js";

// Botones
const botonRegistrarse = document.getElementById('inicioSesion__formulario__registrarse')! as HTMLButtonElement;
const volverIniciarSesion:HTMLElement = document.getElementById('volverIniciarSesion')!;

// Formularios
const formularioRegistrarse:HTMLElement = document.getElementById('registrarse__formulario')!;
const formularioIniciarSesion:HTMLElement = document.getElementById('inicioSesion__formulario')!;


document.addEventListener("DOMContentLoaded", function() {

    // Le asigna las funciones a los botones
    // Si se hace click en "Registrarse" se muestra el formulario para registrarse
    botonRegistrarse.addEventListener('click', (event)=>{
        event.preventDefault()
        formularioRegistrarse.classList.remove('noActivo');
        formularioIniciarSesion.classList.add('noActivo');
    })

    // Si se hace click en "Iniciar sesion" se muestra el formulario para iniciar sesion
    volverIniciarSesion.addEventListener('click', ()=>{
        formularioRegistrarse.classList.add('noActivo');
        formularioIniciarSesion.classList.remove('noActivo');
    })


    // Si se hace click en un input entonces quita su estado de error
    document.querySelectorAll('.iniciarSesion-input').forEach(input=>{
        input.addEventListener('click', () => {
            input.classList.remove('boton__enError');
            const errorText = input.nextElementSibling;
            if (errorText) {
                errorText.textContent = '';
            }
        });
    })



    // Ventana de inicio de sesion
    const emailInput:HTMLInputElement = document.getElementById('inicioSesion__formulario__ingresarCorreo')! as HTMLInputElement;
    const mensajeErrorEmail: HTMLElement = document.getElementById('errorEmail')!;
    const passwordInput:HTMLInputElement = document.getElementById('inicioSesion__formulario__ingresarPassword')! as HTMLInputElement;
    const mensajeErrorPassword: HTMLElement = document.getElementById('errorPassword')!;
    const botonEnviar: HTMLElement = document.getElementById('inicioSesion__formulario__enviar')!;

    formularioIniciarSesion.addEventListener('submit',async (event)=>{
        event.preventDefault(); // Evita que el formulario recargue la página

        botonEnviar.classList.add('boton__enProceso') // Modifica el estilo del boton para aclarar que se esta procesando la solicitud

        // Elimina, si esta presente, los estados de error
        formularioIniciarSesion.querySelectorAll('.iniciarSesion-input').forEach(input=>input.classList.remove('boton__enError'))
        formularioIniciarSesion.querySelectorAll('.errorText').forEach(textError=>textError.textContent='')


        const respuesta = await solicitudIniciarSesion(emailInput.value,passwordInput.value)
        if(respuesta.errors.length>0){ // Si el servidor devuelve errores en el inicio de sesion los muestra segun corresponda
            mostrarMensaje('',true);
            (respuesta.errors).forEach((error:error) => { // Recorre los errores
                if(error.path==='correo'){ // Si el error es del correo:
                    emailInput.classList.add('boton__enError'); // Cambia el borde del input del correo a rojo
                    if(!mensajeErrorEmail.textContent){ // Verifica si tenia un mensaje de error previo
                        mensajeErrorEmail.textContent=error.msg; // Si no tenia, le coloca 
                    }
                }else{ // Si el error no es del correo, entonces deberia ser de la password
                    passwordInput.classList.add('boton__enError'); // Cambia el borde del input del correo a rojo 
                    if(!mensajeErrorPassword.textContent){ // Verifica si tenia un mensaje de error previo
                        mensajeErrorPassword.textContent=error.msg; // Si no tenia, le coloca 
                    }
                }
            })
        }else if(respuesta.token){ // Si el servidor devuelve el token entonces lo almacena
            localStorage.setItem('tokenAcceso',respuesta.token); // Guarda el token en el navegador del usuario para usarlo cuando se requiera
            location.reload(); // Recarga la pagina
        }
        botonEnviar.classList.remove('boton__enProceso') // Modifica el estilo del boton para aclarar que la solicitud termino
    })











    // Ventana de registrarse
    const nombreInput:HTMLInputElement = document.getElementById('registrarse__formulario__ingresarNombre')! as HTMLInputElement;
    const mensajeErrorNombre:HTMLElement = document.getElementById('errorNombreRegistro')!;
    const registroEmailInput:HTMLInputElement = document.getElementById('registrarse__formulario__ingresarCorreo')! as HTMLInputElement;
    const mensajeErrorEmailRegistro:HTMLElement = document.getElementById('errorEmailRegistro')!;
    const registroPasswordInput:HTMLInputElement = document.getElementById('registrarse__formulario__ingresarPassword')! as HTMLInputElement;
    const mensajeErrorPasswordRegistro:HTMLElement = document.getElementById('errorPasswordRegistro')!;
    const registroPasswordRepetirInput:HTMLInputElement = document.getElementById('registrarse__formulario__repetirPassword')! as HTMLInputElement;
    const mensajeErrorPasswordRepetirRegistro:HTMLElement = document.getElementById('errorRepetirPasswordRegistro')!;
    const botonEnviarRegistro:HTMLElement = document.getElementById('registrarse__formulario__enviar')!;

    formularioRegistrarse.addEventListener('submit',async (event)=>{
        event.preventDefault(); // Evita que el formulario recargue la página

        botonEnviarRegistro.classList.add('boton__enProceso') // Modifica el estilo del boton para aclarar que se esta procesando la solicitud

        // Elimina, si esta presente, los estados de error
        botonEnviarRegistro.querySelectorAll('.iniciarSesion-input').forEach(input=>input.classList.remove('boton__enError'))
        botonEnviarRegistro.querySelectorAll('.errorText').forEach(textError=>textError.textContent='')


        // Compara si las contraseñas introducidas son iguales
        if(registroPasswordInput.value&&registroPasswordRepetirInput.value){ // Primero verifica que ambas no sean nulas
            if(!(registroPasswordInput.value===registroPasswordRepetirInput.value)){ // Luego verifican que sean iguales, y si no lo son:

                registroPasswordRepetirInput.classList.add('boton__enError')
                mensajeErrorPasswordRepetirRegistro.textContent='Las contraseñas introducidas no coinciden'
                mostrarMensaje('',true);
            }else{ // Si las contraseñas son iguales entonces se realiza la peticion POST

                const respuesta = await solicitudRegistrarUsuario(nombreInput.value,registroPasswordInput.value,registroEmailInput.value)
                if(respuesta.errors.length>0){ // Si el servidor devuelve errores en el inicio de sesion los muestra segun corresponda
                    (respuesta.errors).forEach((error:error) => { // Recorre los errores

                        if(error.path==='correo'){ // Si el error es del correo:

                            registroEmailInput.classList.add('boton__enError'); // Cambia el borde del input del correo a rojo
                            if(!mensajeErrorEmailRegistro.textContent){ // Verifica si tenia un mensaje de error previo
                                mensajeErrorEmailRegistro.textContent=error.msg; // Si no tenia, le coloca 
                            }

                        }else if(error.path==='nombre'){
                            
                            nombreInput.classList.add('boton__enError'); // Cambia el borde del input del correo a rojo
                            if(!mensajeErrorNombre.textContent){ // Verifica si tenia un mensaje de error previo
                                mensajeErrorNombre.textContent=error.msg; // Si no tenia, le coloca 
                            }

                        }else{ // Si el error no es del nombre, entonces deberia ser de la password
                            registroPasswordInput.classList.add('boton__enError'); // Cambia el borde del input del correo a rojo 
                            if(!mensajeErrorPasswordRegistro.textContent){ // Verifica si tenia un mensaje de error previo
                                mensajeErrorPasswordRegistro.textContent=error.msg; // Si no tenia, le coloca 
                            }
                        }
                    })
                }else if(respuesta.token){ // Si el servidor devuelve un registro exitoso:

                    const tokenAcceso = respuesta.token; // Define el token de acceso devuelto por el servidor
                    localStorage.setItem('tokenAcceso',tokenAcceso); // Guarda el token en el navegador del usuario para usarlo cuando se requiera
                    document.getElementById('registrarse__formulario')!.classList.add('noActivo') // Desactiva la ventana de inicio de sesion
                    document.getElementById('registrarse__exito')!.classList.remove('noActivo') // Activa la ventana de registro exitoso
                    location.reload(); // Recarga la pagina
                
                }
                botonEnviarRegistro.classList.remove('boton__enProceso') // Modifica el estilo del boton para aclarar que la solicitud termino
            }
        }

    })


})