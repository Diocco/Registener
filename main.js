document.addEventListener("DOMContentLoaded", function() {
    //Crea y/o abre la base de datos
    let db // Data Base
    let tipoSeleccionado //Indica que "tipo" se selecciono en la configuracion de productos
    let categoriaSeleccionada //Indica que "categoria" se selecciono en la configuracion de productos

    function crearDB() {
        //Se crea la base de datos
        let peticionDB = indexedDB.open("DB",1);
    
        peticionDB.onerror = ()=> {
            console.log("Error al abrir la base de datos");
        }
        peticionDB.onsuccess = (event)=> {
            console.log("Almacen abierto con exito");
            db = event.target.result;
            buscarTipos();
            
        }
        peticionDB.onupgradeneeded = (event)=>{
            db = event.target.result;
            let productosDB = db.createObjectStore('productos',{keyPath: 'id'});
            //Crea indices de la base de datos
            productosDB.createIndex(`porTipo`,`tipo`,{unique: false});
            productosDB.createIndex(`porCategoria`,`categoria`,{unique: false});
            console.log("Almacen creado con exito");
        }
    }
    crearDB()

    //Busca los diferentes tipos existentes en la base de datos 
    function buscarTipos() {
        
        //Se busca los diferentes "tipos" que hay en la base de datos
        let tiposEncontrados = []; //Crea un array para guardar todos los tipos encontrados


        let transaccion = db.transaction([`productos`],`readonly`);
        let productosdb = transaccion.objectStore(`productos`);
        let productosdbIndiceTipo = productosdb.index(`porTipo`);
        try { //Maneja el error en caso de que no haya ningun producto para mostrar, por lo que le pide al usuario automaticamente que agrege uno

            let productosdbIndiceTipobusqueda = productosdbIndiceTipo.openCursor();
            productosdbIndiceTipobusqueda.onsuccess=(event)=>{
                let resultado = event.target.result;
                
                if(resultado){//Busca en los resultado del almacen
                    let encontrado=false;
                    
                    tiposEncontrados.forEach(tipo => {
                        if(resultado.value.tipo===tipo){ //Evalua si el tipo del producto existe en los que ya se encontraron
                            encontrado=true;
                        }
                    });
                    if(!encontrado){ //Si no se encontro lo agrega
                        tiposEncontrados.push(resultado.value.tipo); 
                    }
                    resultado.continue()
                }else{//LLega al ultimo resultado
                    cargarTiposEncontrados(tiposEncontrados);
                }

            }
            productosdbIndiceTipobusqueda.onerror=()=>{ventanaEmergente();}
        } catch (error) {
            agregarProducto();
        }
        cargarproductosdb(); //Carga los productos
    }
    
    //Si hay elimina los filtros cargados previamente y luego carga los filtros pasados como parametros
    function cargarTiposEncontrados(tiposEncontrados) {
        //Primero se eliminan los tipos y categorias anteriores
        let indiceIdViejo="contenedorConfiguracionProductos__tipo1Indice";
        let indiceViejo = document.getElementById(indiceIdViejo);
        let i=1;
        while(indiceViejo!==null){
            i++;
            indiceIdViejo=`contenedorConfiguracionProductos__tipo${i}Indice`;
            indiceViejo = document.getElementById(indiceIdViejo);
        }
        document.getElementById("contenedorConfiguracionProductos").innerHTML=``;
        document.getElementById("contenedorConfiguracionProductos__contenido").classList.remove("contenedorConfiguracionProductos__contenido-active");

        let fragmento = document.createDocumentFragment();
        let contenedorTipos = document.getElementById("contenedorConfiguracionProductos");
        for (let i = 0; i < tiposEncontrados.length; i++) {
            let nuevoTipo = document.createElement(`div`);
            nuevoTipo.id=`tipo${i+1}`;
            nuevoTipo.className="tipo";
            nuevoTipo.textContent=tiposEncontrados[i];
            fragmento.appendChild(nuevoTipo);
        }
        contenedorTipos.appendChild(fragmento);

        //Se les asigna su eventlistener para escuchar cuando se hace un click sobre ellos
        const tipos = document.querySelectorAll(".tipo"); //Se escucha el evento de click en los botones de los tipos
        tipos.forEach(tipo => { //Se le adjunta un comportamiento a los tipos para que cuando se les hace click se muevan
            tipo.addEventListener("click", (event) => {
                tipoSeleccionado =  event.target.textContent;
                animacionTipoSeleccion(event.target.id);
            })
        });

        buscarCategorias(tiposEncontrados);
    }

    //Busca las diferentes categorias existentes en la base de datos
    function buscarCategorias(tiposEncontrados) {

        //Se busca las diferentes "categorias" que hay en la base de datos
        let transaccion = db.transaction([`productos`],`readonly`);
        
        for (let i = 0; i < tiposEncontrados.length; i++) { //Busca que categorias hay para cada tipo
            let categoriasEncontradas = [];

            //Por cada busqueda se tiene que hacer una transaccion nueva
            let productosdb = transaccion.objectStore(`productos`);
            let productosdbIndiceTipo = productosdb.index(`porTipo`);
            let productosdbIndiceTipobusqueda = productosdbIndiceTipo.openCursor(IDBKeyRange.only(tiposEncontrados[i])); //Filtra los resultados para un tipo especifico
            
            productosdbIndiceTipobusqueda.onsuccess=(event)=>{
                let resultado = event.target.result;
                if(resultado){//Busca en los resultado filtrados por un tipo especifico
                    let encontrado=false;
                    
                    categoriasEncontradas.forEach(categoria => {
                        if(resultado.value.categoria===categoria){ //Evalua si la categoria del producto existe en los que ya se encontraron
                            encontrado=true;
                        }
                    });
                    if(!encontrado){ //Si no se encontro lo agrega
                        categoriasEncontradas.push(resultado.value.categoria); 
                    }
                    resultado.continue()
                }else{//LLega al ultimo resultado, asi que se guarda las categorias encontradas para el tipo especifico
                    cargarCategoriasEncontradas(tiposEncontrados[i],categoriasEncontradas,i); //Carga las categorias encontradas

                    
                }
            }
            productosdbIndiceTipobusqueda.onerror=()=>{ventanaEmergente();}
        }


    
    }

    //Carga las categorias pasadas como parametros
    function cargarCategoriasEncontradas(tipo,categoriasEncontradas,numeroTipo) {
        let nodoSiguiente = document.getElementById("contenedorConfiguracionProductos__contenido");
        
        let contenedorCategoria = document.createElement(`div`);
        contenedorCategoria.id=`contenedorConfiguracionProductos__tipo${numeroTipo+1}Indice`
        contenedorCategoria.className=`contenedorConfiguracionProductos__indice`

        for (let i = 0; i < categoriasEncontradas.length; i++) {
            let categoria = document.createElement(`div`);
            categoria.id=`tipo${numeroTipo+1}__categoria${i+1}`;
            categoria.className="tipo__categoria";
            categoria.textContent=categoriasEncontradas[i];
            contenedorCategoria.appendChild(categoria);
        }
        document.body.insertBefore(contenedorCategoria,nodoSiguiente);

        for (let i = 0; i < categoriasEncontradas.length; i++) {
            let id = `tipo${numeroTipo+1}__categoria${i+1}`
            document.getElementById(id).addEventListener("click",()=>{
                categoriaSeleccionada = event.target.textContent;
                document.getElementById("contenedorConfiguracionProductos__contenido").classList.remove("contenedorConfiguracionProductos__contenido-active");
                setTimeout(() => {
                    cargarproductosdb();
                    document.getElementById("contenedorConfiguracionProductos__contenido").classList.add("contenedorConfiguracionProductos__contenido-active");
                }, 200);
            })
            
        }
    }

    //Carga los elementos de la base de datos
    function cargarproductosdb() {
    
        let transaccion = db.transaction([`productos`],`readonly`);
        let productosdb = transaccion.objectStore(`productos`);
        let productosdbIndiceTipo = productosdb.index(`porTipo`);
        let contenedorConfiguracionProductosContenido = document.getElementById("contenedorConfiguracionProductos__contenido"); 
        let sumarProducto;
        let fragmento = document.createDocumentFragment()
        
        //Reinicia el contenedor
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
        let productosdbIndiceTipobusqueda = productosdbIndiceTipo.openCursor();


        productosdbIndiceTipobusqueda.onsuccess = (event)=>{ //Si el cursor se abre correctamente...

            let resultado = event.target.result; //Selecciona el cursor para recorrerlo

            if(resultado){
                let producto = resultado.value; //Contiene al objeto encontrado
                let seleccionado;
                if(producto.categoria===categoriaSeleccionada){ //Verifica si el producto es de la misma categoria que se selecciono

                    if (producto.seleccionado) { //Verifica que el producto este seleccionado previamente para agregarle la clase active
                        seleccionado = `<div id="${producto.id}" Seleccionado="${producto.seleccionado}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__seleccionadoActive">O</div>`
                    } else { //Si no esta seleccionado no le agrega la clase active
                        seleccionado = `<div id="${producto.id}" Seleccionado="${producto.seleccionado}" class="contenedorConfiguracionProductos__contenido__modificarBoton">O</div>`
                    }

                    sumarProducto = document.createElement(`div`); //Crea un nuevo elemento para agregar el producto de la base de datos al DOM
                    //Le coloca toda la informacion necesaria al elemento
                    sumarProducto.innerHTML=` 
                    <div>${producto.nombre}</div>
                    <div>${producto.precio}</div>
                    <div>${producto.stock}</div>
                    <div>${producto.id}</div>
                    <div class="contenedorConfiguracionProductos__contenido__modificar">
                    ${seleccionado}
                        <div id="${producto.id}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__modificar">I</div>
                        <div id="${producto.id}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__eliminar">X</div>
                    </div>
                    `
                    sumarProducto.classList=`tipo__categoria__producto`; //Le agrega la clase al elemento que contiene el objeto encontrado
                    fragmento.appendChild(sumarProducto); //Suma el nuevo elemento a al fragmento
                }
                resultado.continue(); //Continua con los siguientes objetos 
            }else{ //Una vez que termina...
                contenedorConfiguracionProductosContenido.appendChild(fragmento); //Agrega todos los productos encontrados

                //Le da funcionalidad a los botones de los productos
                let contenedorBotonesModificar = document.querySelectorAll(".contenedorConfiguracionProductos__contenido__modificar"); //Selecciona los contenedores de los botones
                contenedorBotonesModificar.forEach(contenedor => { //Recorre los contenedores
                    let hijos=contenedor.children; //Array con todos los hijos del contenedor, en este caso los botones
                    let botonSeleccionar=hijos[0]; 
                    let botonModificar=hijos[1]; 
                    let botonEliminar=hijos[2]; 
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

                // Crea y agrega el boton de crear productos
                let botonAgregar = document.createElement('button'); 
                botonAgregar.innerHTML=`+`;
                botonAgregar.id=`contenedorConfiguracionProductos__contenido__agregar`;
                contenedorConfiguracionProductosContenido.appendChild(botonAgregar) //Agrega el boton de agregar productos
                let contenedorConfiguracionProductos__contenido__agregar = document.getElementById("contenedorConfiguracionProductos__contenido__agregar");
                contenedorConfiguracionProductos__contenido__agregar.addEventListener("click", ()=>{ventanaEmergenteModificarProducto()})
            }
        }
    }
    
    //Anima cuando se hace click sobre un tipo
    function animacionTipoSeleccion(tipoSeleccionadoId) { //Obtiene el id del tipo seleccionado
        let contenedorTipoContenido = document.querySelectorAll(".contenedorConfiguracionProductos__indice"); //Selecciona a todos los nodos de los contenidos de los tipos
        
        for (let i = 0; i < contenedorTipoContenido.length; i++) { //Recorre todos los nodos de contenidos de los tipos
            
            if(contenedorTipoContenido[i].id.includes(tipoSeleccionadoId)){ //Si en el id del contenedor evaluado se encuentra el id del indice seleccionado entonces lo muestra
                contenedorTipoContenido[i].classList.add("contenedorConfiguracionProductos__indice-active");
            }else{ //Si no se encontro el id entonces lo esconde
                setTimeout(() => {
                    contenedorTipoContenido[i].classList.remove("contenedorConfiguracionProductos__indice-active");
                }, 200);
            }
        }  
    }
    
    //Funcion del boton agregar elemento
    function agregarProducto() {
        //Le pregunta al usuario sobre el producto
        let productoFoto = undefined // Funcionalidad para agregar en un futuro
        let productoNombre = prompt("Ingrese el nombre del producto");
        let productoId = prompt("Ingrese el ID del producto");
        let productoPrecio = prompt("Ingrese el precio del producto");
        let productoStock = prompt("Ingrese el stock del producto")
        let productoTipo = tipoSeleccionado;
        let productoCategoria = categoriaSeleccionada;
        let productoColor = undefined // Funcionalidad para agregar en un futuro
        let productoCodigoBarra = undefined // Funcionalidad para agregar en un futuro
        let productoPromocionable = undefined // Funcionalidad para agregar en un futuro
        let productoDescripcion = prompt("Ingrese una descripcion del producto");
        let productoOrden = undefined // Funcionalidad para agregar en un futuro
        let productoSeleccionado = true // Indica si el producto esta seleccionado para mostrarse en la parte de venta

        productoNuevo={
            foto: `${productoFoto}`,
            nombre: `${productoNombre}`,
            id: `${productoId}`,
            precio: `${productoPrecio}`,
            stock: `${productoStock}`,
            tipo: `${productoTipo}`,
            categoria: `${productoCategoria}`,
            color:`${productoColor}`,
            codigoBarra: `${productoCodigoBarra}`,
            promocionable: `${productoPromocionable}`,
            descripcion: `${productoDescripcion}`,
            orden: `${productoOrden}`,
            seleccionado: productoSeleccionado
        }

        //Agrega el producto a la base de datos
        let transaccion = db.transaction([`productos`],`readwrite`);
        let dbProductos = transaccion.objectStore(`productos`);
        let respuesta = dbProductos.add(productoNuevo);

        respuesta.onsuccess = ()=>{
            console.log("Objeto agregado con exito");
            cargarproductosdb(); //Una vez que se agrego el objeto a la base de datos, se actualiza el contenido
        }
        respuesta.onerror = ()=>{
            console.log("No se pudo agregar el objeto")
        }
    }

    //Funcion para el boton de seleccionar productos para que aparezcan o no en la seccion de seleccion de productos
    function productosdbAlternarSeleccionarProducto(productoId) {
        let transaccion = db.transaction([`productos`],`readwrite`); //Abre la base de datos para modificarla (readwrite)
        let productosdb = transaccion.objectStore(`productos`); // Selecciona el almacen de objetos correcto
        let productosdbIndiceTipo = productosdb.index(`porTipo`); // Selecciona el filtro de objetos
        //Abre un cursor para recorrer el filtro
        let productosdbIndiceTipobusqueda = productosdbIndiceTipo.openCursor(IDBKeyRange.only(tipoSeleccionado)); 

        productosdbIndiceTipobusqueda.onsuccess = (event)=>{ //Si se abre correctamente lo recorre

            let resultado = event.target.result; //Selecciona el producto

            if(resultado){ //Comienza con la busqueda del producto
                let producto = resultado.value; //Contiene al objeto encontrado

                if(producto.id===productoId){ //Si lo encuetra...
                    if (producto.seleccionado) { //Y si estaba seleccionado...
                        producto.seleccionado=false //Entonces lo alterna 
                    } else { // Y si no estaba seleccionado
                        producto.seleccionado=true //Lo deja seleccionado
                    }
                    let actualizar = resultado.update(producto); //Actualiza la base de datos
                    actualizar.onsuccess=()=>{ //Si se pudo realizar el proceso
                        console.log("Producto modificado con exito");
                    }
                    actualizar.onerror=()=>{ //Proceso con error
                        console.log("Error: No se pudo modificar el producto");
                    }
                }else{ //Si no lo encuentra...
                    resultado.continue(); //Continua con los siguientes objetos
                }

            }else{ //Cuando termina de buscar...
                console.log("Termino la busqueda");
            }
        }

        productosdbIndiceTipobusqueda.onerror = ()=>{
            console.log("No se pudo abrir la base de datos correctamente");
        }
    }

    //Funcion para eliminar productos de la base de datos
    function productosdbEliminarProducto(productoId) {
        
        ventanaEmergente(0).then(respuesta=>{
            if(respuesta){
                let transaccion = db.transaction([`productos`],`readwrite`); //Abre la base de datos para modificarla (readwrite)
                let productosdb = transaccion.objectStore(`productos`); // Selecciona el almacen de objetos correcto
                let solicitud = productosdb.delete(productoId);
                solicitud.onerror= ()=>{ventanaEmergente();}
                buscarTipos();
                cargarproductosdb();
            }
        })
    }

    //Funcion que alterna el color del fondo en los momentos donde hay ventanas emergentes
    function alternarFondoVentanaEmergente(caso) {
        let fondo=document.getElementById("ventanaEmergenteFondo");
        let ventana=document.getElementById("ventanaEmergente");
        let ventanaEmergenteModificarProducto = document.getElementById("ventanaEmergenteModificarProducto")
        fondo.classList.toggle("ventanaEmergenteFondo-active");

        switch (caso) {
            case 0:
                ventana.classList.toggle("ventanaEmergente-active");
                break;
            case 1:
                ventanaEmergenteModificarProducto.classList.toggle("ventanaEmergenteModificarProducto-active");
            break
            default:
                break;
        }
    }

    //Ventanas emergentes para confirmaciones del usuario o errores
    function ventanaEmergente(caso) {
        return new Promise((resolve) => {
            let mensaje=document.getElementById("ventanaEmergente__contenido__mensaje");
            let botonAceptar=document.getElementById("ventanaEmergente__contenido__aceptar__boton");
            let botonRechazar=document.getElementById("ventanaEmergente__contenido__rechazar__boton");
            let contorno=document.getElementById("ventanaEmergente");
    
                botonAceptar.onclick=()=>{
                    alternarFondoVentanaEmergente(0);
                    resolve(true);
                }
                botonRechazar.onclick=()=>{
                    alternarFondoVentanaEmergente(0);
                    resolve(false);
                }

    
        alternarFondoVentanaEmergente(0);
    
            switch (caso) { //Se ponen distintos casos de error
                case 0:
                    mensaje.textContent="¿Esta seguro que quiere eliminar este producto?"
                    break;
            
                default:
                    mensaje.textContent="Error desconocido";
                    break;
            }
        })
    }

    //Ventana emergente para modificar un producto de la base de datos
    function ventanaEmergenteModificarProducto(productoId) {
        let aceptar = document.getElementById("ventanaEmergenteModificarProducto__contenido__AceptarRechazar__aceptar");
        let rechazar = document.getElementById("ventanaEmergenteModificarProducto__contenido__AceptarRechazar__rechazar");
        
        let nombre = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__nombre");
        let precio = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__precio");
        let stock = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__stock");
        let id = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__id");
        let color = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__color");
        let codigoBarra = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__codigoBarra");
        let promocionable = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__promocionable");
        let tipo = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__tipo");
        let categoria = document.getElementById("ventanaEmergenteModificarProducto__contenido__caracteristicas__categoria");
        let descripcion = document.getElementById("ventanaEmergenteModificarProducto__contenido__fotoDescripcion__descripcion");
        
        //Les da un valor inicial
        nombre.value = "";
        precio.value = "";
        stock.value = "";
        id.value = "";
        color.value = "";
        codigoBarra.value = "";
        promocionable.value = "";
        descripcion.value = "";
        tipo.value = tipoSeleccionado;
        categoria.value = categoriaSeleccionada;

        alternarFondoVentanaEmergente(1)

        let transaccion = db.transaction([`productos`],`readwrite`); //Abre la base de datos para modificarla (readwrite)
        let productosdb = transaccion.objectStore(`productos`); // Selecciona el almacen de objetos correcto
        let productosdbIndiceTipo = productosdb.index(`porTipo`); // Selecciona el filtro de objetos

        if(!(productoId===undefined)){ //Si a la funcion se le paso un ID de un producto entonces la funcion es para modificarlo
            //Abre un cursor para recorrer el filtro
            let productosdbIndiceTipobusqueda = productosdbIndiceTipo.openCursor(IDBKeyRange.only(tipoSeleccionado)); 

            productosdbIndiceTipobusqueda.onsuccess = (event)=>{ //Si se abre correctamente lo recorre

                let resultado = event.target.result; //Selecciona el producto

                if(resultado){ //Comienza con la busqueda del producto
                    let producto = resultado.value; //Contiene al objeto encontrado

                    if(producto.id===productoId){ //Si lo encuetra...

                        //Coloca su informacion en los inputs editables por el usuario
                            nombre.value = producto.nombre;
                            precio.value = producto.precio;
                            stock.value = producto.stock;
                            id.value = producto.id;
                            color.value = producto.color;
                            codigoBarra.value = producto.codigoBarra;
                            promocionable.value = producto.promocionable
                            tipo.value = producto.tipo;
                            categoria.value = producto.categoria;

                    }else{ //Si no lo encuentra...
                        resultado.continue(); //Continua con los siguientes objetos
                    }

                }else{ //Cuando termina de buscar...

                }
            }

            productosdbIndiceTipobusqueda.onerror = ()=>{
                console.log("No se pudo abrir la base de datos correctamente");
            }
        }   
        return new Promise((resolve) => { //Esperamos la respuesta de los botones aceptar o rechazar

            aceptar.onclick=()=>{ //Si se apreta aceptar...
                transaccion = db.transaction([`productos`],`readwrite`); //Se vuelve a abrir la base de datos para modificarla (readwrite)
                let productosdb = transaccion.objectStore(`productos`); // Selecciona el almacen de objetos correcto
                let productoNuevo //Aca se va a almacenar el producto nuevo o modificado
                if(!(productoId===undefined)){ //Si a la funcion se le paso un ID de un producto entonces la funcion es para modificarlo
                    actualizarProducto = productosdb.get(productoId); //Selecciona el producto a modificar
                    actualizarProducto.onsuccess = (event)=>{ //Si se abre correctamente...

                        console.log("Se vuelve a abrir la base de datos");
                        productoNuevo = event.target.result; //Selecciona el producto.
            
                        //Remplaza su informacion con la ingresada en los inputs editados por el usuario
                        productoNuevo.nombre = nombre.value;
                        productoNuevo.precio = precio.value;
                        productoNuevo.stock = stock.value;
                        productoNuevo.id = id.value; //Hay que verificar que sea unico, y si se cambia hay que eliminar el anterior
                        productoNuevo.color = color.value;
                        productoNuevo.codigoBarra = codigoBarra.value; //Hay que verificar que que sea unico
                        productoNuevo.promocionable = promocionable.value;
                        productoNuevo.tipo = tipo.value; //Hay que verificar que haya un tipo igual
                        productoNuevo.categoria = categoria.value; //Hay que verificar que haya una categoria igual
                        productoNuevo.descripcion = descripcion.value
                        try{
                            let modificar = productosdb.put(productoNuevo); // Remplaza el producto en la base de datos o lo crea si no existe
                            modificar.onsuccess=()=>{
                                console.log("Modificado con exito");
                                cargarproductosdb();
                            }
                            modificar.onerror=()=>{
                                console.log("Error al modificar");
                            }
                        }catch{
                            ventanaEmergente();
                        }
                    }
                    actualizarProducto.onerror=()=>{ //Si no se abre correctamente...
                        ventanaEmergente(); //Le da un error al usuario
                    }

                }else{ //Si la funcion es para agregar producto entonces...
                    productoNuevo={
                        foto: ``,
                        nombre: `${nombre.value}`,
                        id: `${id.value}`,
                        precio: `${precio.value}`,
                        stock: `${stock.value}`,
                        tipo: `${tipo.value}`,
                        categoria: `${categoria.value}`,
                        color:`${color.value}`,
                        codigoBarra: `${codigoBarra.value}`,
                        promocionable: `${promocionable.value}`,
                        descripcion: `${descripcion.value}`,
                        orden: ``,
                        seleccionado: true
                    }
                    try{
                        let modificar = productosdb.put(productoNuevo); // Remplaza el producto en la base de datos o lo crea si no existe
                        modificar.onsuccess=()=>{
                            cargarproductosdb();
                        }
                        modificar.onerror=()=>{
                            console.log("Error al modificar");
                        }
                    }catch{
                        ventanaEmergente();
                    }
                }   

                alternarFondoVentanaEmergente(1);
                buscarTipos(); //Vuelve a cargar los tipos y categorias nuevamente
                resolve(true);
            }
            rechazar.onclick=()=>{ //Si se apreta rechazar no se guardan los datos cambiados
                alternarFondoVentanaEmergente(1);
                resolve(false);
            }
        })
    }

    

    //Carga el area de seleccion de productos

    const conjuntosProductos = document.querySelectorAll(".seleccionProducto"); //Crea un nodeList de todos los objetos que tengan como clase "seleccionProducto", es decir, todos los botones en el apartado de seleccion de productos

    botonSeleccionSubir.addEventListener("click", function() { //Actualiza el stock del area de configuracion con el area de seleccion de productos

        const conjuntosProductosArray = Array.from(conjuntosProductos); // Convierte el NodeList de los productos de la seleccion a un array
        let i=0;

        conjuntosConfiguracionProductos = document.querySelectorAll(".seleccionConfiguracionInicialRellenaProducto"); // Crea un nodeList de los elementos correspondientes a pastas rellenas que se ubican en la configuracion
        conjuntosConfiguracionProductos.forEach(function(conjunto){ //Recorre los elementos de la configuracion
            if(conjunto.querySelector(".agregarProducto").checked===true){ //Verifica que el elemento de la configuracion tenga la casilla chequeada
                const stock = conjuntosProductosArray[i].querySelector(".seleccionStock").textContent; //Guarda el stock del elemento de la seleccion
                conjunto.querySelector(".seleccionConfiguracionProductoStock").value = stock; // Actualiza el stock del elemento de la configuracion
                i++;
            }
        })

        i=12;
        conjuntosConfiguracionProductos = document.querySelectorAll(".seleccionConfiguracionInicialSecaProducto"); // Actualiza el nodeList con la siguiente columna de elementos
        conjuntosConfiguracionProductos.forEach(function(conjunto){ //Recorre los elementos de la configuracion
            if(conjunto.querySelector(".agregarProducto").checked===true){ //Verifica que el elemento de la configuracion tenga la casilla chequeada
                const stock = conjuntosProductosArray[i].querySelector(".seleccionStock").textContent; //Guarda el stock del elemento de la seleccion
                conjunto.querySelector(".seleccionConfiguracionProductoStock").value = stock; // Actualiza el stock del elemento de la configuracion
                i++;
            }
        })

        i=24;
        conjuntosConfiguracionProductos = document.querySelectorAll(".seleccionConfiguracionInicialToppingProducto"); // Actualiza el nodeList con la siguiente columna de elementos
        conjuntosConfiguracionProductos.forEach(function(conjunto){ //Recorre los elementos de la configuracion
            if(conjunto.querySelector(".agregarProducto").checked===true){ //Verifica que el elemento de la configuracion tenga la casilla chequeada
                const stock = conjuntosProductosArray[i].querySelector(".seleccionStock").textContent; //Guarda el stock del elemento de la seleccion
                conjunto.querySelector(".seleccionConfiguracionProductoStock").value = stock; // Actualiza el stock del elemento de la configuracion
                i++;
            }
        })
    })
    
});
