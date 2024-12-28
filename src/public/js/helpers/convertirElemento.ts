export const convertirAInput =(botonOrigen:HTMLElement,IdFinal?:string,sessionStorageNombre:string='',tipo:string='text',volverADIV:boolean=false,funcionRecarga?:Function)=>{
    // Convierte a input el div pasado como argumento, cuando se hace click en el
    const tituloBotonOrigen = botonOrigen.textContent! // Almacena el titulo del div
    const clasesBotonOrigen = botonOrigen.className // Almacena la clase del div
    const idBotonOrigen = botonOrigen.id // Almacena el id del div
    
    const valor = sessionStorage.getItem(sessionStorageNombre) // Este es el valor que debe tener el input una vez convertido
    if(!IdFinal) IdFinal= new Date().getTime().toString() // Si no se pasa un id para el input, se crea uno de forma aleatoria
    botonOrigen.outerHTML=`<input type="${tipo}" class="inputRegistener1 ${clasesBotonOrigen}" id="${IdFinal}">` // Convierte el div a un input

    // Busca el nuevo input
    const inputFinal = document.getElementById(IdFinal)! as HTMLInputElement
    inputFinal.value=valor||'' // Le un valor previo o lo deja vacio

    // Añadir un event listener al input para leer lo que se escribe en el teclado
    inputFinal.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            // Realiza la búsqueda cuando presionas Enter
            sessionStorage.setItem(sessionStorageNombre,inputFinal.value);
            if(funcionRecarga) funcionRecarga()
            if(volverADIV||!inputFinal.value) convertirADIV(inputFinal,IdFinal,sessionStorageNombre,tipo,volverADIV,funcionRecarga,clasesBotonOrigen,idBotonOrigen,tituloBotonOrigen)
        }
    });

    // Añadir un event listener al cuando pierde el foco
    inputFinal.addEventListener('blur', () => {
        // Se hace clic fuera del elemento
        sessionStorage.setItem(sessionStorageNombre,inputFinal.value);
        if(funcionRecarga) funcionRecarga()
        if(volverADIV||!inputFinal.value) convertirADIV(inputFinal,IdFinal,sessionStorageNombre,tipo,volverADIV,funcionRecarga,clasesBotonOrigen,idBotonOrigen,tituloBotonOrigen)
    });

    return inputFinal
}

const convertirADIV =(botonOrigen:HTMLInputElement,IdFinal:string,sessionStorageNombre:string='',tipo:string='text',volverADIV:boolean=false,funcionRecarga:Function|undefined,claseDIV:string,idDIV:string,tituloDIV:string)=>{
    const valorInput = botonOrigen.value // Almacena el valor del input
    botonOrigen.outerHTML=`<div class="${claseDIV}" id="${idDIV}">${volverADIV?valorInput:tituloDIV}</div>` // Convierte el boton a un input


    // Busca el nuevo div
    const divFinal = document.getElementById(idDIV)! as HTMLDivElement

    // Añadir un event listener al input
    divFinal.onclick=()=>{
        const elementoFinal = convertirAInput(divFinal,IdFinal,sessionStorageNombre,tipo,volverADIV,funcionRecarga)
        elementoFinal.focus()
    }



    return divFinal
}