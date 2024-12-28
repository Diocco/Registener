export const cargarPaginadoRegistros =(cantidadPaginas:number,contenedorPaginas:HTMLElement,nombreSeccion:string,funcionRecarga:Function /* Cantidad de paginas total necesarias para ver todos los resultados*/)=>{
    // Agrega las paginas de los elementos
    contenedorPaginas.innerHTML='' // Vacia el contenedor previo

    // Calcula el rango de paginado
    let paginaDecena = Number(sessionStorage.getItem(`${nombreSeccion}-paginaDecena`))||0
    const desdePagina = paginaDecena===0?1:paginaDecena*10 // El inicio de la pagina esta en el rango: [1,10,20,30,...,N]
    let paginaSeleccionada = Number(sessionStorage.getItem(`${nombreSeccion}-pagina`)); // Pagina seleccionada actual
    const paginaHasta = cantidadPaginas>paginaDecena*10+9?paginaDecena*10+9:cantidadPaginas // El final del rango es 9 mas que la inicial en el caso de que la cantidad de paginas sea mayor que eso, sino el final es la cantidad de paginas 
    
    if(!(desdePagina<=paginaSeleccionada&&paginaSeleccionada<=paginaHasta)) { // Verifica que la pagina seleccionada actual se encuentre dentro de la cantidad de paginas actuales
        paginaSeleccionada=paginaDecena===0?1:paginaDecena*10;
        sessionStorage.setItem(`${nombreSeccion}-pagina`,`${paginaSeleccionada}`)
    }
    

    if(paginaDecena>1){ // Si las decenas del paginado es mayor que 1 entonces agrega un boton para volver al principio
        const botonReducirPaginado = document.createElement('button')
        botonReducirPaginado.className='botonRegistener2'
        botonReducirPaginado.innerHTML=`<i class="fa-solid fa-angles-left"></i>`
        botonReducirPaginado.onclick=()=>{
            paginaDecena=paginaDecena-1
            sessionStorage.setItem(`${nombreSeccion}-paginaDecena`,`0`) // Vuelve a la primera pagina
            sessionStorage.setItem(`${nombreSeccion}-pagina`,`1`) // Deja seleccionado la primera pagina
            funcionRecarga() // Recarga los registros
        }
        contenedorPaginas.appendChild(botonReducirPaginado)
    }

    if(paginaDecena>0){ // Si las decenas del paginado es mayor que cero entonces agrega un boton para reducirlo
        const botonReducirPaginado = document.createElement('button')
        botonReducirPaginado.className='botonRegistener2'
        botonReducirPaginado.innerHTML=`<i class="fa-solid fa-angle-left"></i>`
        botonReducirPaginado.onclick=()=>{
            paginaDecena=paginaDecena-1
            sessionStorage.setItem(`${nombreSeccion}-paginaDecena`,`${paginaDecena}`) // Aumenta el valor de la decena en el indice de paginas
            sessionStorage.setItem(`${nombreSeccion}-pagina`,`${paginaDecena===0?1:paginaDecena*10}`)       
            funcionRecarga() // Recarga los registros
        }
        contenedorPaginas.appendChild(botonReducirPaginado)
    }

    // Agrega los indices dentro del contenedor
    for (let i = desdePagina; i < paginaHasta+1; i++) {
        const indice = document.createElement('button')
        indice.className='botonRegistener2'
        if(paginaSeleccionada===i) indice.classList.add('boton__activo2') // Si el boton representa a la pagina actualmente activa entonces le da el estilo de activado
        indice.innerText=i.toString();
        indice.onclick=()=>{
            sessionStorage.setItem(`${nombreSeccion}-pagina`,i.toString())
            funcionRecarga()
        }
        
        contenedorPaginas.appendChild(indice)
    }
    if(paginaHasta<cantidadPaginas){ // Si la cantidad de paginas para seleccionar es menor a la cantidad de paginas totales entonces agrega un boton para aumentar la cantidad de paginas seleccionables
        const botonAumentarPaginado = document.createElement('button')
        botonAumentarPaginado.className='botonRegistener2'
        botonAumentarPaginado.innerHTML=`<i class="fa-solid fa-angle-right"></i>`
        botonAumentarPaginado.onclick=()=>{
            paginaDecena=paginaDecena+1
            sessionStorage.setItem(`${nombreSeccion}-paginaDecena`,`${paginaDecena}`) // Aumenta el valor de la decena en el indice de paginas
            sessionStorage.setItem(`${nombreSeccion}-pagina`,`${paginaDecena===0?1:paginaDecena*10}`)
            funcionRecarga() // Recarga los registros
        }
        contenedorPaginas.appendChild(botonAumentarPaginado)
    }

    if(paginaHasta<cantidadPaginas-10){ // Si la cantidad de paginas para seleccionar es menor a la cantidad de paginas totales entonces agrega un boton para aumentar la cantidad de paginas seleccionables
        const botonAumentarPaginado = document.createElement('button')
        botonAumentarPaginado.className='botonRegistener2'
        botonAumentarPaginado.innerHTML=`<i class="fa-solid fa-angles-right"></i>`
        botonAumentarPaginado.onclick=()=>{
            paginaDecena=paginaDecena+1
            sessionStorage.setItem(`${nombreSeccion}-paginaDecena`,`${cantidadPaginas}`) // Aumenta el valor de la decena en el indice de paginas
            sessionStorage.setItem(`${nombreSeccion}-pagina`,`${paginaDecena===0?1:paginaDecena*10}`)
            funcionRecarga() // Recarga los registros
        }
        contenedorPaginas.appendChild(botonAumentarPaginado)
    }


}