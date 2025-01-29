export const cerrarSesion=()=>{
    localStorage.removeItem('tokenAcceso') // Elimina el token de la sesion
    window.location.reload() // Recarga la pagina
}