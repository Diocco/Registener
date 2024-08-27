interface Producto {
    foto:string,
    nombre:string,
    precio:number,
    stock:number,
    id:string,
    color:string,
    codigoBarra:number,
    promocionable:string,
    descripcion:string,
    tipo:string,
    categoria:string,
    seleccionado:string,
    orden:number
}

document.addEventListener("DOMContentLoaded", function() {

    let tipoSeleccionado:string //Indica que "tipo" se selecciono en la configuracion de productos
    let categoriaSeleccionada:string //Indica que "categoria" se selecciono en la configuracion de productos
    
    
    //Abre la base de datos, y si no existe la crea
    let db:IDBDatabase // Data Base
    let peticionDB:IDBOpenDBRequest = indexedDB.open("DB",1);

    peticionDB.onerror = ():void=> {ventanaEmergente("Error al abrir la base de datos");
    }

    peticionDB.onsuccess = (event):void=> {
        db = (event.target as IDBOpenDBRequest).result;
        cargarSeccionModificarProductos();
    }
    peticionDB.onupgradeneeded = (event):void=>{
        db = (event.target as IDBOpenDBRequest).result;
        let productosDB:IDBObjectStore = db.createObjectStore('productos',{keyPath: 'id'});
        //Crea indices de la base de datos
        productosDB.createIndex(`porTipo`,`tipo`,{unique: false});
        productosDB.createIndex(`porSeleccion`,`seleccionado`,{unique: false});
    }

    async function cargarSeccionModificarProductos(){
        let tiposEncontrados:string[]
        try {
            tiposEncontrados = await buscarTipos() //Busca los diferentes tipos que hay en la base de datos
            cargarTiposEncontrados(tiposEncontrados); //Carga los indices que contienen a los tipos
            buscarCargarCategorias(tiposEncontrados); //Carga las categorias de cada indice
        } 
        catch (error) {ventanaEmergenteModificarProducto("Error al buscar los tipos en la base de datos")} 
    }

    //Busca los diferentes tipos existentes en la base de datos 
    function buscarTipos():Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            //Se busca los diferentes "tipos" que hay en la base de datos
            let tiposEncontrados:string[]= []; //Crea un array para guardar todos los tipos encontrados
    
            let peticionCursor:IDBRequest<IDBCursorWithValue|null> = db.transaction([`productos`],`readonly`).objectStore(`productos`).index(`porTipo`).openCursor();
            peticionCursor.onsuccess=(event)=>{ //Si tiene exito en la peticion ejecuta el codigo
                let cursor:IDBCursorWithValue = (event.target as IDBRequest).result;
                if(cursor){//Busca en los resultado del almacen
                    let encontrado:boolean=false; //Variable para determinar si se encontro o no un tipo
                    
                    tiposEncontrados.forEach(tipo => {
                        if(cursor.value.tipo===tipo){ //Evalua si el tipo del producto existe en los que ya se encontraron
                            encontrado=true;
                        }
                    });
                    if(!encontrado){ //Si no se encontro lo agrega
                        tiposEncontrados.push(cursor.value.tipo); 
                    }
                    cursor.continue()
                }else{//LLega al ultimo resultado
                    resolve(tiposEncontrados);
                }
    
            }
            peticionCursor.onerror=()=>{reject()} //Si el cursor devuelve un error entonces es porque el almacen esta vacio, asi que se llama a la funcion para agregar un producto
    
            cargarproductosdb(); //Carga los productos
            
        })
    }
    
    //Si hay elimina los filtros cargados previamente y luego carga los filtros pasados como parametros
    function cargarTiposEncontrados(tiposEncontrados:string[]):void {
        //Primero se eliminan los tipos y categorias anteriores
        const nodoPadre:HTMLElement = document.body;
        const nodosHijosAnteriores: NodeListOf<Element> = document.querySelectorAll(".contenedorConfiguracionProductos__indice")
        nodosHijosAnteriores.forEach(nodoHijoAnterior => {
            nodoPadre.removeChild(nodoHijoAnterior);
        });

        //Vacia el contenedor de productos
        const contenedorTipos:HTMLElement=document.getElementById("contenedorConfiguracionProductos")!
        contenedorTipos.innerHTML=`` //Vacia el contenedor

        //Comienza con la carga de tipos
        const fragmento:DocumentFragment = document.createDocumentFragment();
        for (let i = 0; i < tiposEncontrados.length; i++) { //Crea el contenedor de todos los tipos encontrados
            let nuevoTipo:HTMLDivElement = document.createElement(`div`); 
            nuevoTipo.id=`tipo${i+1}`;
            nuevoTipo.className="tipo";
            nuevoTipo.textContent=tiposEncontrados[i];
            fragmento.appendChild(nuevoTipo); //Agrega los contenedores creados al fragmento
        }
        contenedorTipos.appendChild(fragmento); //Carga el fragmento al DOM

        //Se les la funcion a los elementos creados cuando se les hace click en ellos
        const tipos = document.querySelectorAll(".tipo");
        tipos.forEach(tipo => { //Se le adjunta un comportamiento a los tipos para que cuando se les hace click muestren las categorias que contienen
            tipo.addEventListener("click", function(event){
                const botonPresionado = event.target! as Element;

                tipoSeleccionado =  botonPresionado.textContent!;
                animacionTipoSeleccion(botonPresionado.id); //Activa el contenedor con las categorias contenidas en el tipo seleccionado

                //Intercambia el active de los diferentes botones de los tipos
                let botonActive:(Element | null)= document.querySelector(".tipo-active"); //Selecciona (si hay) algun boton que este activo
                document.querySelector(".tipo-active")?botonActive!.classList.remove("tipo-active"):""; //Si hay un boton activo, lo desactiva, sino no hace nada
                (botonPresionado as Element).classList.add("tipo-active"); //Le asigna el active al boton seleccionado

            })
        });
    }

    //Anima cuando se hace click sobre un tipo
    function animacionTipoSeleccion(tipoSeleccionadoId:string) { //Obtiene el id del tipo seleccionado
        let contenedorTipoContenido = document.querySelectorAll(".contenedorConfiguracionProductos__indice"); //Selecciona todos los nodos de los contenedores de categorias
        for (let i = 0; i < contenedorTipoContenido.length; i++) { //Recorre todos los nodos de contenidos de categorias
            
            if(contenedorTipoContenido[i].id.includes(tipoSeleccionadoId)){ //Si en el id del contenedor evaluado se encuentra el id del tipo seleccionado entonces lo muestra,caso contrario, lo esconde
                contenedorTipoContenido[i].classList.add("contenedorConfiguracionProductos__indice-active");
            }else{
                contenedorTipoContenido[i].classList.remove("contenedorConfiguracionProductos__indice-active");
            }
        }  
    }

    //Busca las diferentes categorias existentes en la base de datos
    function buscarCargarCategorias(tiposEncontrados:string[]):void {


    //Se busca las diferentes "categorias" que hay en la base de datos
    for (let i = 0; i < tiposEncontrados.length; i++) { //Busca que categorias hay para cada tipo
        let categoriasEncontradas:string[]=["Vacio"];

        //Por cada busqueda se tiene que hacer una transaccion nueva
        let peticionCursor:IDBRequest<IDBCursorWithValue|null> = db.transaction([`productos`],`readonly`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tiposEncontrados[i])); //Hace una peticion para abrir un cursor para recorrer el almacen, filtrado por el tipo encontrado

        peticionCursor.onsuccess=(event)=>{ //Si la peticion se resuelve correctamente...
            let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
            let encontrado:boolean=false;
            
            if(cursor){//Busca en los resultado filtrados por un tipo especifico
                let categoriaProducto:string = cursor.value.categoria;

                if(categoriasEncontradas[0]==="Vacio"){categoriasEncontradas[0]=categoriaProducto;}  //Si el array esta vacio, entonces agrega la categoria del primer elemento como primer elemento
                else{ //Si el array no esta vacio entonces verifica si las categoria del producto se encuentra dentro del array
                    categoriasEncontradas.forEach(categoria => {
                        if(categoriaProducto===categoria){ //Evalua si la categoria del producto existe en los que ya se encontraron
                            encontrado=true;
                        }
                    });
                    if(!encontrado){ //Si no se encontro lo agrega
                        categoriasEncontradas.push(categoriaProducto); 
                    }
                }
                cursor.continue()
            }else{//LLega al ultimo resultado, asi que se guarda las categorias encontradas para el tipo especifico
                console.log(i+" "+categoriasEncontradas)
                cargarCategoriasEncontradas(categoriasEncontradas,i); //Carga las categorias encontradas
            }
        }
        peticionCursor.onerror=()=>{ventanaEmergente("Error al abrir un cursor");}
    }
}

//Carga las categorias pasadas como parametros
function cargarCategoriasEncontradas(categoriasEncontradas:string[],numeroTipo:number) {

    let nodoSiguiente:HTMLElement = document.getElementById("contenedorConfiguracionProductos__contenido")!;
    nodoSiguiente?"":ventanaEmergente("Error al seleccionar el nodo siguiente"); //Verifica que no sea nulo

    let contenedorCategoria:HTMLDivElement = document.createElement(`div`);
    contenedorCategoria.id=`contenedorConfiguracionProductos__tipo${numeroTipo+1}Indice`
    contenedorCategoria.className=`contenedorConfiguracionProductos__indice`

    for (let i = 0; i < categoriasEncontradas.length; i++) {
        let categoria:HTMLDivElement = document.createElement(`div`); //Crea el contenedor para los productos de una misma categoria
        categoria.id=`tipo${numeroTipo+1}__categoria${i+1}`;
        categoria.className="tipo__categoria";
        categoria.textContent=categoriasEncontradas[i];
        contenedorCategoria.appendChild(categoria);
    }
    document.body.insertBefore(contenedorCategoria,nodoSiguiente); //Lo inserta en el DOM

    for (let i = 0; i < categoriasEncontradas.length; i++) { //Le agrega la funcionalidad cuando sobre se hace click en el indice de las distintas categorias
        let indiceCategoria:HTMLElement = document.getElementById(`tipo${numeroTipo+1}__categoria${i+1}`)! //Selecciona un indice que contiene una categoria

        indiceCategoria.addEventListener("click",function(){ //Le da la funcionalidad
            categoriaSeleccionada = this.textContent!; //Se modifica la variable global indicando que se selecciono una categoria en particular

            cargarproductosdb(); //Vuelve a cargar la categoria

        })
        
    }
}

    //Carga los elementos de la base de datos
    function cargarproductosdb() {
    
        let contenedorConfiguracionProductosContenido:HTMLElement = document.getElementById("contenedorConfiguracionProductos__contenido")!; //Selecciona el contenedor donde se cargan los productos y lo vacia
        contenedorConfiguracionProductosContenido.innerHTML=`
        <div class="tipo__categoria__producto">
        <div>Nombre</div>
        <div>Precio</div>
        <div>Stock</div>
        <div>ID</div>
        <div>Modificar</div>
        </div>
        `

        //Abre un cursor para recorrer la base de datos
        
        let sumarProducto;
        let fragmento = document.createDocumentFragment()
        
        
        let cursorPeticion:IDBRequest<IDBCursorWithValue|null> = db.transaction([`productos`],`readonly`).objectStore(`productos`).index(`porTipo`).openCursor(); //Selecciona el cursor para recorrer el almacen de productos filtrados por tipo
        cursorPeticion.onsuccess = (event)=>{ //Si el cursor se abre correctamente...

            let cursor:IDBCursorWithValue = (event.target as IDBRequest).result; //Selecciona el cursor para poder recorrer los productos hallados

            if(cursor){
                let producto: Producto= cursor.value; //Contiene al objeto encontrado
                let seleccionadoInnerHTML:string;
                if(producto.categoria===categoriaSeleccionada){ //Verifica si el producto es de la misma categoria que se selecciono

                    if (producto.seleccionado==="true") { //Verifica que el producto este seleccionado previamente para agregarle la clase active
                        seleccionadoInnerHTML = `<div id="${producto.id}" Seleccionado="${producto.seleccionado}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__seleccionadoActive">O</div>`
                    } else { //Si no esta seleccionado no le agrega la clase active
                        seleccionadoInnerHTML = `<div id="${producto.id}" Seleccionado="${producto.seleccionado}" class="contenedorConfiguracionProductos__contenido__modificarBoton">O</div>`
                    }

                    sumarProducto = document.createElement(`div`); //Crea un nuevo elemento para agregar el producto de la base de datos al DOM
                    //Le coloca toda la informacion necesaria al elemento
                    sumarProducto.innerHTML=` 
                    <div>${producto.nombre}</div>
                    <div>${producto.precio}</div>
                    <div>${producto.stock}</div>
                    <div>${producto.id}</div>
                    <div class="contenedorConfiguracionProductos__contenido__modificar">
                        ${seleccionadoInnerHTML}
                        <div id="${producto.id}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__modificar">I</div>
                        <div id="${producto.id}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__eliminar">X</div>
                    </div>
                    `

                    sumarProducto.classList.add(`tipo__categoria__producto`); //Le agrega la clase al elemento que contiene el objeto encontrado
                    fragmento.appendChild(sumarProducto); //Suma el nuevo elemento al fragmento
                }
                cursor.continue(); //Continua con los siguientes objetos 
            }else{ //Una vez que termina...
                contenedorConfiguracionProductosContenido.appendChild(fragmento); //Agrega todos los productos encontrados

                //Le da funcionalidad a los botones de los productos
                let contenedorBotonesModificar:NodeListOf<Element> = document.querySelectorAll(".contenedorConfiguracionProductos__contenido__modificar"); //Selecciona los contenedores de los botones
                contenedorBotonesModificar.forEach(contenedor => { //Recorre los contenedores
                    let hijos:HTMLCollection=contenedor.children; //Array con todos los hijos del contenedor, en este caso los botones
                    let botonSeleccionar: Element=hijos[0]; 
                    let botonModificar: Element=hijos[1]; 
                    let botonEliminar: Element=hijos[2]; 

                    botonSeleccionar.addEventListener("click",()=>{
                        productosdbAlternarSeleccionarProducto(botonSeleccionar.id); //Alterna la seleccion del producto
                        botonSeleccionar.classList.toggle("contenedorConfiguracionProductos__contenido__modificarBoton__seleccionadoActive"); //Alterna la clase del boton para visualizar grafica si esta o no seleccionado
                    })
                    botonModificar.addEventListener("click",()=>{
                        ventanaEmergenteModificarProducto(botonSeleccionar.id);

                    })
                    botonEliminar.addEventListener("click",()=>{
                        productosdbEliminarProducto(botonSeleccionar.id);

                    })
                });

                
                let botonAgregar:HTMLButtonElement = document.createElement('button'); // Crea el boton de crear productos
                botonAgregar.innerHTML=`+`;
                botonAgregar.id=`contenedorConfiguracionProductos__contenido__agregar`;
                contenedorConfiguracionProductosContenido.appendChild(botonAgregar) //Agrega el boton de agregar productos al DOM
                document.getElementById(botonAgregar.id)!.addEventListener("click", ()=>{ventanaEmergenteModificarProducto()}) //Selecciona el boton recien agregado al DOM y le da la funcion cuando se le hace click en el
            }
        }
        cursorPeticion.onerror=()=>{ventanaEmergente("Error al cargar los productos");}
    }
    


    //Funcion para el boton de seleccionar productos para que aparezcan o no en la seccion de seleccion de productos
    function productosdbAlternarSeleccionarProducto(productoId:string) {
        let cursorPeticion:IDBRequest<IDBCursorWithValue|null> = db.transaction([`productos`],`readwrite`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tipoSeleccionado)); //Selecciona el cursor para recorrer el almacen de productos filtrados por tipo y modificarlo

        cursorPeticion.onsuccess = (event)=>{ //Si se abre correctamente lo recorre
            let cursor:IDBCursorWithValue = (event.target as IDBRequest).result; //Selecciona el cursor para poder recorrer los productos hallados

            if(cursor){ //Comienza con la busqueda del producto
                let producto:Producto = cursor.value; //Contiene al objeto encontrado

                if(producto.id===productoId){ //Si lo encuetra...
                    if (producto.seleccionado==="true") { //Y si estaba seleccionado...
                        producto.seleccionado="false" //Entonces lo alterna 
                    } else { // Y si no estaba seleccionado
                        producto.seleccionado="true" //Lo deja seleccionado
                    }

                    let peticionActualizar:IDBRequest<IDBValidKey> = cursor.update(producto); //Actualiza la base de datos
                    peticionActualizar.onsuccess=()=>{ //Si se pudo realizar el proceso
                    }
                    peticionActualizar.onerror=()=>{ //Proceso con error
                        ventanaEmergente("No se pudo modificar el producto");
                    }
                }else{ //Si no lo encuentra...
                    cursor.continue(); //Continua con los siguientes objetos
                }

            }
        }

        cursorPeticion.onerror = ()=>{
            ventanaEmergente("No se pudo abrir la base de datos correctamente");
        }
    }

    //Funcion para eliminar productos de la base de datos
    function productosdbEliminarProducto(productoId:string) {
        
        ventanaEmergente(0).then(respuesta=>{ //Consulta al usuario si realmente quiere eliminar el producto
            if(respuesta){
                let solicitudEliminar:IDBRequest = db.transaction([`productos`],`readwrite`).objectStore(`productos`).delete(productoId); //Abre la base de datos para eliminar el producto con el id recibido como argumento
                solicitudEliminar.onerror= ()=>{ventanaEmergente("No se pudo eliminar el producto");}
                buscarTipos(); //Actualiza el contenedor de productos para reflejar los cambios
            }
        })
    }

    //Funcion que alterna el color del fondo en los momentos donde hay ventanas emergentes
    function alternarFondoVentanaEmergente() {
        let fondo:HTMLElement=document.getElementById("ventanaEmergenteFondo")!;
        let ventanaEmergenteModificarProducto:HTMLElement = document.getElementById("ventanaEmergenteModificarProducto")!

        fondo.classList.toggle("ventanaEmergenteFondo-active"); //Alterna el activa del fondo oscuro de la pantalla emergente
        ventanaEmergenteModificarProducto.classList.toggle("ventanaEmergenteModificarProducto-active");

    }

    //Ventanas emergentes para confirmaciones del usuario o errores
    function ventanaEmergente(error:(number|string),alternaFondo:Boolean=true):Promise<boolean> {
        return new Promise((resolve) => {
            let mensaje:HTMLElement=document.getElementById("ventanaEmergente__contenido__mensaje")!;
            let fondo:HTMLElement=document.getElementById("ventanaEmergenteFondo")!
            let botonAceptar:HTMLElement=document.getElementById("ventanaEmergente__contenido__aceptar__boton")!;
            let botonRechazar:HTMLElement=document.getElementById("ventanaEmergente__contenido__rechazar__boton")!;
            let ventana:HTMLElement=document.getElementById("ventanaEmergente")!;
            ventana.classList.toggle("ventanaEmergente-active"); //Muestra la ventana
    
            botonAceptar.onclick=()=>{
                if(alternaFondo){fondo.classList.toggle("ventanaEmergenteFondo-active");} //Alterna el fondo oscuro
                ventana.classList.toggle("ventanaEmergente-active"); //Esconde la ventana
                resolve(true);
            }
            botonRechazar.onclick=()=>{
                if(alternaFondo){fondo.classList.toggle("ventanaEmergenteFondo-active");} //Alterna el fondo oscuro
                ventana.classList.toggle("ventanaEmergente-active"); //Esconde la ventana
                resolve(false);
            }

            if(alternaFondo){fondo.classList.toggle("ventanaEmergenteFondo-active");} //Alterna el fondo oscuro
    
            switch (error) { //Se ponen distintos casos de error
                case 0:
                    mensaje.textContent="¿Esta seguro que quiere eliminar este producto?"
                    break;
            
                default:
                    if(typeof error==="number"){
                        mensaje.textContent=`Error desconocido (${error})`; //Si se pasa como argumento un codigo de error no especificado se estipula
                    }else{
                        mensaje.textContent=error; //Si se pasa un mensaje de error como argumento se lo muestra en pantalla
                    }
                    break;
            }
        })
    }

    //Ventana emergente para modificar o agregar un producto de la base de datos
    function ventanaEmergenteModificarProducto(productoId?:string) {
        let aceptar:HTMLElement = document.getElementById("ventanaEmergenteModificarProducto__contenido__AceptarRechazar__aceptar")!;
        let rechazar:HTMLElement = document.getElementById("ventanaEmergenteModificarProducto__contenido__AceptarRechazar__rechazar")!;
        
        //Selecciona los input en donde el usuario agregara las diferentes caracteristicas del producto
        let nombre = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__nombre") as HTMLInputElement ;
        let precio = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__precio") as HTMLInputElement;
        let stock = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__stock") as HTMLInputElement;
        let id = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__id") as HTMLInputElement;
        let color = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__color") as HTMLInputElement;
        let codigoBarra = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__codigoBarra") as HTMLInputElement;
        let promocionable = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__promocionable") as HTMLInputElement;
        let tipo = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__tipo") as HTMLInputElement;
        let categoria = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__categoria") as HTMLInputElement;
        let descripcion = document.getElementById("ventanaEmergenteModificarProducto__contenido__fotoDescripcion__descripcion") as HTMLInputElement;
        
        //Les da un valor inicial
        tipo.value = tipoSeleccionado;
        categoria.value = categoriaSeleccionada;

        alternarFondoVentanaEmergente()
        
        if(!(productoId===undefined)){ //Si a la funcion se le paso un ID de un producto entonces la funcion es para modificarlo un producto
            //Realiza una peticion para recorrer el almacen y modificar el almacen, filtrado por el tipo seleccionado
            let cursorPeticion: IDBRequest<IDBCursorWithValue | null> =db.transaction([`productos`],`readwrite`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tipoSeleccionado)); 
            cursorPeticion.onsuccess = (event)=>{ //Si se abre correctamente lo recorre
                let cursor:IDBCursorWithValue = (event.target as IDBRequest).result; //Selecciona el cursor para poder recorrer los productos hallados

                if(cursor){ //Comienza con la busqueda del producto
                    let producto:Producto = cursor.value; //Contiene al objeto encontrado

                    if(producto.id===productoId){ //Si lo encuetra un objeto con el mismo id que el buscado...

                        //Coloca su informacion en los inputs editables por el usuario
                            nombre.value = producto.nombre;
                            precio.value = `${producto.precio}`;
                            stock.value = `${producto.stock}`;
                            id.value = producto.id;
                            color.value = producto.color;
                            codigoBarra.value = `${producto.codigoBarra}`;
                            promocionable.value = producto.promocionable;
                            tipo.value = producto.tipo;
                            categoria.value = producto.categoria;

                    }else{ //Si no lo encuentra...
                        cursor.continue(); //Continua con los siguientes objetos
                    }
                }
            }

            cursorPeticion.onerror = ()=>{
                ventanaEmergente("No se pudo abrir la base de datos correctamente");
            }
        }   
        return new Promise((resolve) => { //Esperamos la respuesta de los botones aceptar o rechazar

            aceptar.onclick=():void=>{ //Si se apreta aceptar...
                //Verifica la informacion ingreada por el usuario
                let verificado:boolean=false
                if(isNaN(Number(precio.value))){ventanaEmergente("El precio ingresado no es valido",false);}
                else if(isNaN(Number(stock.value))){ventanaEmergente("El stock ingresado no es valido",false);}
                else if(isNaN(Number(codigoBarra.value))){ventanaEmergente("El codigo de barra ingresado no es valido",false);}
                else{verificado=true;}

                if(verificado){ //Si la informacion ingresada tiene el formato correcto entonces se sigue con la ejecucion...
                    let productoNuevo:Producto //Aca se va a almacenar el producto nuevo o modificado
    
                    if(!(productoId===undefined)){ //Si a la funcion se le paso un ID de un producto entonces la funcion es para modificarlo
                        let peticionActualizarProducto: IDBRequest<Producto> = db.transaction([`productos`],`readwrite`).objectStore(`productos`).get(productoId); // Selecciona el almacen de objetos correcto y selecciona el producto a modificar
                        peticionActualizarProducto.onsuccess = (event)=>{ //Si se abre correctamente...
    
                            productoNuevo = (event.target as IDBRequest).result; //Selecciona el producto.
                            //Remplaza su informacion con la ingresada en los inputs editados por el usuario
                            productoNuevo.nombre = nombre.value;
                            productoNuevo.precio = Number(precio.value);
                            productoNuevo.stock = Number(stock.value);
                            productoNuevo.id = id.value; //Hay que verificar que sea unico, y si se cambia hay que eliminar el anterior
                            productoNuevo.color = color.value;
                            productoNuevo.codigoBarra = Number(codigoBarra.value); //Hay que verificar que que sea unico
                            productoNuevo.promocionable = promocionable.value;
                            productoNuevo.tipo = tipo.value; //Hay que verificar que haya un tipo igual
                            productoNuevo.categoria = categoria.value; //Hay que verificar que haya una categoria igual
                            productoNuevo.descripcion = descripcion.value;
    
                            let peticionModificar: IDBRequest = db.transaction([`productos`],`readwrite`).objectStore(`productos`).put(productoNuevo); // Remplaza el producto en la base de datos o lo crea si no existe
                            peticionModificar.onsuccess=()=>{
                                cargarproductosdb();
                                alternarFondoVentanaEmergente();
                                resolve(true);
                            }
                            peticionModificar.onerror=()=>{
                                ventanaEmergente("Error al modificar");
                            }
                        }
                        peticionActualizarProducto.onerror=()=>{ //Si no se abre correctamente...
                            ventanaEmergente("Error al actualizar producto"); //Le da un error al usuario
                        }
    
                    }else{ //Si la funcion es para agregar producto entonces...
                        productoNuevo={
                            foto: ``,
                            nombre: `${nombre.value}`,
                            id: `${id.value}`,
                            precio: Number(precio.value),
                            stock: Number(stock.value),
                            tipo: `${tipo.value}`,
                            categoria: `${categoria.value}`,
                            color:color.value,
                            codigoBarra: Number(codigoBarra.value),
                            promocionable: `${promocionable.value}`,
                            descripcion: `${descripcion.value}`,
                            orden: 0,
                            seleccionado: "true"
                        }
    
                        let peticionModificar: IDBRequest = db.transaction([`productos`],`readwrite`).objectStore(`productos`).put(productoNuevo); // Remplaza el producto en la base de datos o lo crea si no existe
                        peticionModificar.onsuccess=()=>{
                            alternarFondoVentanaEmergente();
                            cargarproductosdb();
                            resolve(true);
                        }
                        peticionModificar.onerror=()=>{
                            ventanaEmergente("Error al modificar");
                        }
                        
                    }   
                }
            }
            rechazar.onclick=()=>{ //Si se apreta rechazar no se guardan los datos cambiados
                alternarFondoVentanaEmergente();
                cargarproductosdb();
                resolve(false);
            }
        })
    }

    


    //Carga y le da funciones a la barra lateral
    document.getElementById("barraLateral_A__icono")!.addEventListener("click",()=>{
        document.getElementById("contenedorConfiguracionProductos")!.scrollIntoView();
    });
    document.getElementById("barraLateral_A__nombre")!.addEventListener("click",()=>{
        document.getElementById("contenedorConfiguracionProductos")!.scrollIntoView();
    });
    document.getElementById("barraLateral_B__icono")!.addEventListener("click",()=>{
        document.getElementById("seleccionProductos")!.scrollIntoView();
    });
    document.getElementById("barraLateral_B__nombre")!.addEventListener("click",()=>{
        document.getElementById("seleccionProductos")!.scrollIntoView();
    });
    document.getElementById("barraLateral_C__icono")!.addEventListener("click",()=>{
        document.getElementById("seleccionExtra")!.scrollIntoView();
    });
    document.getElementById("barraLateral_C__nombre")!.addEventListener("click",()=>{
        document.getElementById("seleccionExtra")!.scrollIntoView();
    });
    






    //Carga el area de seleccion de productos
    document.getElementById("barraLateral_B__icono")!.onclick=()=>{
        cargarSeleccionProductos();
    }
    document.getElementById("barraLateral_B__nombre")!.onclick=()=>{
        cargarSeleccionProductos();
    }
    
    //Carga la seccion de seleccion de productos, se ejecuta cada vez que se hace click sobre la barra lateral para desplazarse a este mismo
    function cargarSeleccionProductos() {
        let contenedorIndiceTipos:HTMLElement = document.getElementById("seleccionProductos")!;
        contenedorIndiceTipos.innerHTML=`` //Vacia la seccion por si habia elementos cargados previamente
        buscarTiposSeleccionados().then(tiposSeleccionados=>{ //Primero busca los tipos que tengan almenos un producto seleccionado
            const fragmento:DocumentFragment = document.createDocumentFragment();
            let numeroTipo:number = 1;

            tiposSeleccionados.forEach(tipo => { //Recorre los tipos seleccionados
                const titulo:HTMLDivElement = document.createElement("div");
                titulo.classList.add("seleccionProductos__indiceTitulo");
                titulo.textContent=tipo;

                const indiceTipo:HTMLDivElement = document.createElement("div"); //Y crea un div para cada tipo
                indiceTipo.appendChild(titulo);
                indiceTipo.classList.add("seleccionProductos__indice");
                indiceTipo.id=`seleccionProductos__indiceTipo${numeroTipo}`

                numeroTipo++;
                buscarProductosSeleccionados(tipo).then(productosSeleccionados =>{ //Se busca los productos seleccionados que tiene ese tipo
                    productosSeleccionados.forEach(producto => {
                        let productoCreado:HTMLDivElement = document.createElement("div");
                        productoCreado.classList.add("seleccionProducto");
                        productoCreado.innerHTML=`
                        <button class="seleccionSumarProducto">${producto.nombre}</button>
                        <button class="seleccionRestarProducto">-</button>
                        <div class="seleccionCantidad">0</div>
                        <div class="seleccionStock">${producto.stock}</div>
                        `

                        indiceTipo.appendChild(productoCreado); //Agrega el producto encontrado al contenedor del mismo tipo
                    });
                })
                fragmento.appendChild(indiceTipo); //Agrega el tipo, con todos los productos que cumplen dicho tipo, al fragmento
            });

            contenedorIndiceTipos.appendChild(fragmento); //Agrega todos los elementos cargados al DOM
            //A continuacion se les da las funciones a todos los botones
            setTimeout(() => { //Se coloca un retraso para darle tiempo a que los elementos se carguen en el DOM
                document.querySelectorAll(".seleccionProducto").forEach(conjuntoBotones => {
                    let botonSumar:Element = conjuntoBotones.children[0]
                    let botonRestar:Element = conjuntoBotones.children[1]
                    let cantidad:Element = conjuntoBotones.children[2]
                    let stock:Element = conjuntoBotones.children[3]

                    botonSumar.addEventListener("click",()=>{
                        cantidad.textContent=`${Number(cantidad.textContent)+1}`;
                        stock.textContent=`${Number(stock.textContent)-1}`;
                        if(Number(cantidad.textContent)==0){
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }else if(Number(cantidad.textContent)<0){
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                            cantidad.classList.add("seleccionCantidad-active2");
                        }else{
                            cantidad.classList.add("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }
                    })
                    botonRestar.addEventListener("click",()=>{
                        cantidad.textContent=`${Number(cantidad.textContent)-1}`;
                        stock.textContent=`${Number(stock.textContent)+1}`;
                        if(Number(cantidad.textContent)==0){
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }else if(Number(cantidad.textContent)<0){
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.add("seleccionCantidad-active2");
                        }else{
                            cantidad.classList.add("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }
                    })
                });
            }, 10);
        })
    }
    

    //Busca los tipos que tengan productos seleccionados
    function buscarTiposSeleccionados():Promise<string[]> {
        //Se busca los diferentes "tipos" que hay en la base de datos que esten seleccionados
        return new Promise((resolve) => {
            let tiposSeleccionadosEncontrados:string[]=["Vacio"]; //Crea un array vacio para guardar todos los tipos encontrados

            let peticionCursor:IDBRequest<IDBCursorWithValue | null>= db.transaction([`productos`],`readonly`).objectStore(`productos`).index(`porSeleccion`).openCursor(IDBKeyRange.only("true")); //Abre el almacen filtrado por los productos seleccionado
            peticionCursor.onsuccess=(event)=>{ //El filtro se aplico con exito
                let cursorTiposSeleccionados:IDBCursorWithValue = (event.target as IDBRequest).result;
                if(cursorTiposSeleccionados){ //Recorre el cursor 
                    let tipoEncontrado:boolean=false; 
                    if(tiposSeleccionadosEncontrados[0]==="Vacio"){tiposSeleccionadosEncontrados[0]=cursorTiposSeleccionados.value.tipo;} //Si el array esta vacio entonces coloca como primer elemento el primer tipo del primer producto encontrado
                    else{ //Si tiene tipos encontrados entonces los recorre para buscar nuevos y agregarlos
                        tiposSeleccionadosEncontrados.forEach(tipoSeleccionado => { 
                            if (tipoSeleccionado===cursorTiposSeleccionados.value.tipo) {//Verifica si el tipo actual se encuentra en el array de tipos encontrados
                                tipoEncontrado=true; //Si lo encuentra se deja constancia
                            }
                        });
                        if(!tipoEncontrado){tiposSeleccionadosEncontrados.push(cursorTiposSeleccionados.value.tipo);} //Si despues de recorrer el array de tipos encontrados no se encontro el tipo que se esta evaluando entonces lo agrega
                    }
                    cursorTiposSeleccionados.continue(); //Se sigue con el siguiente tipo
                }else{ //Una vez que se termina de buscar...
                    resolve(tiposSeleccionadosEncontrados);
                }
            }
        })

    }

    //Funcion que se le pasa como parametro el "tipo" y busca los productos con ese "tipo" y que esten seleccionados para mostrarse
    function buscarProductosSeleccionados(tipo:string):Promise<Producto[]> {
        //Se busca los diferentes productos que esten seleccionados para un tipo especifico
        return new Promise((resolve) => {
            let productosSeleccionadosEncontrados:Producto[]=[]; //Crea un array para guardar todos los productos encontrados

            let peticionCursor = db.transaction([`productos`],`readonly`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tipo)); //Abre una peticion para abrir un cursor para recorrer el almacen filtrado por el tipo recibido como parametro
    
            peticionCursor.onsuccess=(event)=>{ //Si el cursor se abrio con exito...
                let cursorProductosFiltrados:IDBCursorWithValue = (event.target as IDBRequest).result;
                if(cursorProductosFiltrados){ //Recorre el cursor  
                    if(cursorProductosFiltrados.value.seleccionado==="true"){//Almacena el producto filtrado que este seleccionado
                        if(productosSeleccionadosEncontrados===undefined){productosSeleccionadosEncontrados=cursorProductosFiltrados.value;} //Si el array esta vacio coloca el primer producto como el primer elemento 
                        else{productosSeleccionadosEncontrados.push(cursorProductosFiltrados.value);}
                    }
                    cursorProductosFiltrados.continue(); //Se sigue con el siguiente tipo
                }else{ //Una vez que se termina de buscar...
                    resolve(productosSeleccionadosEncontrados);
                }
            }
        })

        
    }
});
