"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", function () {
    let tipoSeleccionado; //Indica que "tipo" se selecciono en la configuracion de productos
    let categoriaSeleccionada; //Indica que "categoria" se selecciono en la configuracion de productos
    //Abre la base de datos, y si no existe la crea
    let db; // Data Base
    let peticionDB = indexedDB.open("DB", 1);
    peticionDB.onerror = () => {
        ventanaEmergente("Error al abrir la base de datos");
    };
    peticionDB.onsuccess = (event) => {
        db = event.target.result;
        cargarSeccionModificarProductos();
    };
    peticionDB.onupgradeneeded = (event) => {
        db = event.target.result;
        let productosDB = db.createObjectStore('productos', { keyPath: 'id' });
        //Crea indices de la base de datos
        productosDB.createIndex(`porTipo`, `tipo`, { unique: false });
        productosDB.createIndex(`porSeleccion`, `seleccionado`, { unique: false });
    };
    function cargarSeccionModificarProductos() {
        return __awaiter(this, void 0, void 0, function* () {
            let tiposEncontrados;
            try {
                tiposEncontrados = yield buscarTipos(); //Busca los diferentes tipos que hay en la base de datos
                cargarTiposEncontrados(tiposEncontrados); //Carga los indices que contienen a los tipos
                buscarCargarCategorias(tiposEncontrados); //Carga las categorias de cada indice
            }
            catch (error) {
                ventanaEmergenteModificarProducto("Error al buscar los tipos en la base de datos");
            }
        });
    }
    //Busca los diferentes tipos existentes en la base de datos 
    function buscarTipos() {
        return new Promise((resolve, reject) => {
            //Se busca los diferentes "tipos" que hay en la base de datos
            let tiposEncontrados = []; //Crea un array para guardar todos los tipos encontrados
            let peticionCursor = db.transaction([`productos`], `readonly`).objectStore(`productos`).index(`porTipo`).openCursor();
            peticionCursor.onsuccess = (event) => {
                let cursor = event.target.result;
                if (cursor) { //Busca en los resultado del almacen
                    let encontrado = false; //Variable para determinar si se encontro o no un tipo
                    tiposEncontrados.forEach(tipo => {
                        if (cursor.value.tipo === tipo) { //Evalua si el tipo del producto existe en los que ya se encontraron
                            encontrado = true;
                        }
                    });
                    if (!encontrado) { //Si no se encontro lo agrega
                        tiposEncontrados.push(cursor.value.tipo);
                    }
                    cursor.continue();
                }
                else { //LLega al ultimo resultado
                    resolve(tiposEncontrados);
                }
            };
            peticionCursor.onerror = () => { reject(); }; //Si el cursor devuelve un error entonces es porque el almacen esta vacio, asi que se llama a la funcion para agregar un producto
            cargarproductosdb(); //Carga los productos
        });
    }
    //Si hay elimina los filtros cargados previamente y luego carga los filtros pasados como parametros
    function cargarTiposEncontrados(tiposEncontrados) {
        //Primero se eliminan los tipos y categorias anteriores
        const nodoPadre = document.body;
        const nodosHijosAnteriores = document.querySelectorAll(".contenedorConfiguracionProductos__indice");
        nodosHijosAnteriores.forEach(nodoHijoAnterior => {
            nodoPadre.removeChild(nodoHijoAnterior);
        });
        //Vacia el contenedor de productos
        const contenedorTipos = document.getElementById("contenedorConfiguracionProductos");
        contenedorTipos.innerHTML = ``; //Vacia el contenedor
        //Comienza con la carga de tipos
        const fragmento = document.createDocumentFragment();
        for (let i = 0; i < tiposEncontrados.length; i++) { //Crea el contenedor de todos los tipos encontrados
            let nuevoTipo = document.createElement(`div`);
            nuevoTipo.id = `tipo${i + 1}`;
            nuevoTipo.className = "tipo";
            nuevoTipo.textContent = tiposEncontrados[i];
            fragmento.appendChild(nuevoTipo); //Agrega los contenedores creados al fragmento
        }
        contenedorTipos.appendChild(fragmento); //Carga el fragmento al DOM
        //Se les la funcion a los elementos creados cuando se les hace click en ellos
        const tipos = document.querySelectorAll(".tipo");
        tipos.forEach(tipo => {
            tipo.addEventListener("click", function (event) {
                const botonPresionado = event.target;
                tipoSeleccionado = botonPresionado.textContent;
                animacionTipoSeleccion(botonPresionado.id); //Activa el contenedor con las categorias contenidas en el tipo seleccionado
                //Intercambia el active de los diferentes botones de los tipos
                let botonActive = document.querySelector(".tipo-active"); //Selecciona (si hay) algun boton que este activo
                document.querySelector(".tipo-active") ? botonActive.classList.remove("tipo-active") : ""; //Si hay un boton activo, lo desactiva, sino no hace nada
                botonPresionado.classList.add("tipo-active"); //Le asigna el active al boton seleccionado
            });
        });
    }
    //Anima cuando se hace click sobre un tipo
    function animacionTipoSeleccion(tipoSeleccionadoId) {
        let contenedorTipoContenido = document.querySelectorAll(".contenedorConfiguracionProductos__indice"); //Selecciona todos los nodos de los contenedores de categorias
        for (let i = 0; i < contenedorTipoContenido.length; i++) { //Recorre todos los nodos de contenidos de categorias
            if (contenedorTipoContenido[i].id.includes(tipoSeleccionadoId)) { //Si en el id del contenedor evaluado se encuentra el id del tipo seleccionado entonces lo muestra,caso contrario, lo esconde
                contenedorTipoContenido[i].classList.add("contenedorConfiguracionProductos__indice-active");
            }
            else {
                contenedorTipoContenido[i].classList.remove("contenedorConfiguracionProductos__indice-active");
            }
        }
    }
    //Busca las diferentes categorias existentes en la base de datos
    function buscarCargarCategorias(tiposEncontrados) {
        //Se busca las diferentes "categorias" que hay en la base de datos
        for (let i = 0; i < tiposEncontrados.length; i++) { //Busca que categorias hay para cada tipo
            let categoriasEncontradas = ["Vacio"];
            //Por cada busqueda se tiene que hacer una transaccion nueva
            let peticionCursor = db.transaction([`productos`], `readonly`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tiposEncontrados[i])); //Hace una peticion para abrir un cursor para recorrer el almacen, filtrado por el tipo encontrado
            peticionCursor.onsuccess = (event) => {
                let cursor = event.target.result;
                let encontrado = false;
                if (cursor) { //Busca en los resultado filtrados por un tipo especifico
                    let categoriaProducto = cursor.value.categoria;
                    if (categoriasEncontradas[0] === "Vacio") {
                        categoriasEncontradas[0] = categoriaProducto;
                    } //Si el array esta vacio, entonces agrega la categoria del primer elemento como primer elemento
                    else { //Si el array no esta vacio entonces verifica si las categoria del producto se encuentra dentro del array
                        categoriasEncontradas.forEach(categoria => {
                            if (categoriaProducto === categoria) { //Evalua si la categoria del producto existe en los que ya se encontraron
                                encontrado = true;
                            }
                        });
                        if (!encontrado) { //Si no se encontro lo agrega
                            categoriasEncontradas.push(categoriaProducto);
                        }
                    }
                    cursor.continue();
                }
                else { //LLega al ultimo resultado, asi que se guarda las categorias encontradas para el tipo especifico
                    console.log(i + " " + categoriasEncontradas);
                    cargarCategoriasEncontradas(categoriasEncontradas, i); //Carga las categorias encontradas
                }
            };
            peticionCursor.onerror = () => { ventanaEmergente("Error al abrir un cursor"); };
        }
    }
    //Carga las categorias pasadas como parametros
    function cargarCategoriasEncontradas(categoriasEncontradas, numeroTipo) {
        let nodoSiguiente = document.getElementById("contenedorConfiguracionProductos__contenido");
        nodoSiguiente ? "" : ventanaEmergente("Error al seleccionar el nodo siguiente"); //Verifica que no sea nulo
        let contenedorCategoria = document.createElement(`div`);
        contenedorCategoria.id = `contenedorConfiguracionProductos__tipo${numeroTipo + 1}Indice`;
        contenedorCategoria.className = `contenedorConfiguracionProductos__indice`;
        for (let i = 0; i < categoriasEncontradas.length; i++) {
            let categoria = document.createElement(`div`); //Crea el contenedor para los productos de una misma categoria
            categoria.id = `tipo${numeroTipo + 1}__categoria${i + 1}`;
            categoria.className = "tipo__categoria";
            categoria.textContent = categoriasEncontradas[i];
            contenedorCategoria.appendChild(categoria);
        }
        document.body.insertBefore(contenedorCategoria, nodoSiguiente); //Lo inserta en el DOM
        for (let i = 0; i < categoriasEncontradas.length; i++) { //Le agrega la funcionalidad cuando sobre se hace click en el indice de las distintas categorias
            let indiceCategoria = document.getElementById(`tipo${numeroTipo + 1}__categoria${i + 1}`); //Selecciona un indice que contiene una categoria
            indiceCategoria.addEventListener("click", function () {
                categoriaSeleccionada = this.textContent; //Se modifica la variable global indicando que se selecciono una categoria en particular
                cargarproductosdb(); //Vuelve a cargar la categoria
            });
        }
    }
    //Carga los elementos de la base de datos
    function cargarproductosdb() {
        let contenedorConfiguracionProductosContenido = document.getElementById("contenedorConfiguracionProductos__contenido"); //Selecciona el contenedor donde se cargan los productos y lo vacia
        contenedorConfiguracionProductosContenido.innerHTML = `
        <div class="tipo__categoria__producto">
        <div>Nombre</div>
        <div>Precio</div>
        <div>Stock</div>
        <div>ID</div>
        <div>Modificar</div>
        </div>
        `;
        //Abre un cursor para recorrer la base de datos
        let sumarProducto;
        let fragmento = document.createDocumentFragment();
        let cursorPeticion = db.transaction([`productos`], `readonly`).objectStore(`productos`).index(`porTipo`).openCursor(); //Selecciona el cursor para recorrer el almacen de productos filtrados por tipo
        cursorPeticion.onsuccess = (event) => {
            let cursor = event.target.result; //Selecciona el cursor para poder recorrer los productos hallados
            if (cursor) {
                let producto = cursor.value; //Contiene al objeto encontrado
                let seleccionadoInnerHTML;
                if (producto.categoria === categoriaSeleccionada) { //Verifica si el producto es de la misma categoria que se selecciono
                    if (producto.seleccionado === "true") { //Verifica que el producto este seleccionado previamente para agregarle la clase active
                        seleccionadoInnerHTML = `<div id="${producto.id}" Seleccionado="${producto.seleccionado}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__seleccionadoActive">O</div>`;
                    }
                    else { //Si no esta seleccionado no le agrega la clase active
                        seleccionadoInnerHTML = `<div id="${producto.id}" Seleccionado="${producto.seleccionado}" class="contenedorConfiguracionProductos__contenido__modificarBoton">O</div>`;
                    }
                    sumarProducto = document.createElement(`div`); //Crea un nuevo elemento para agregar el producto de la base de datos al DOM
                    //Le coloca toda la informacion necesaria al elemento
                    sumarProducto.innerHTML = ` 
                    <div>${producto.nombre}</div>
                    <div>${producto.precio}</div>
                    <div>${producto.stock}</div>
                    <div>${producto.id}</div>
                    <div class="contenedorConfiguracionProductos__contenido__modificar">
                        ${seleccionadoInnerHTML}
                        <div id="${producto.id}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__modificar">I</div>
                        <div id="${producto.id}" class="contenedorConfiguracionProductos__contenido__modificarBoton contenedorConfiguracionProductos__contenido__modificarBoton__eliminar">X</div>
                    </div>
                    `;
                    sumarProducto.classList.add(`tipo__categoria__producto`); //Le agrega la clase al elemento que contiene el objeto encontrado
                    fragmento.appendChild(sumarProducto); //Suma el nuevo elemento al fragmento
                }
                cursor.continue(); //Continua con los siguientes objetos 
            }
            else { //Una vez que termina...
                contenedorConfiguracionProductosContenido.appendChild(fragmento); //Agrega todos los productos encontrados
                //Le da funcionalidad a los botones de los productos
                let contenedorBotonesModificar = document.querySelectorAll(".contenedorConfiguracionProductos__contenido__modificar"); //Selecciona los contenedores de los botones
                contenedorBotonesModificar.forEach(contenedor => {
                    let hijos = contenedor.children; //Array con todos los hijos del contenedor, en este caso los botones
                    let botonSeleccionar = hijos[0];
                    let botonModificar = hijos[1];
                    let botonEliminar = hijos[2];
                    botonSeleccionar.addEventListener("click", () => {
                        productosdbAlternarSeleccionarProducto(botonSeleccionar.id); //Alterna la seleccion del producto
                        botonSeleccionar.classList.toggle("contenedorConfiguracionProductos__contenido__modificarBoton__seleccionadoActive"); //Alterna la clase del boton para visualizar grafica si esta o no seleccionado
                    });
                    botonModificar.addEventListener("click", () => {
                        ventanaEmergenteModificarProducto(botonSeleccionar.id);
                    });
                    botonEliminar.addEventListener("click", () => {
                        productosdbEliminarProducto(botonSeleccionar.id);
                    });
                });
                let botonAgregar = document.createElement('button'); // Crea el boton de crear productos
                botonAgregar.innerHTML = `+`;
                botonAgregar.id = `contenedorConfiguracionProductos__contenido__agregar`;
                contenedorConfiguracionProductosContenido.appendChild(botonAgregar); //Agrega el boton de agregar productos al DOM
                document.getElementById(botonAgregar.id).addEventListener("click", () => { ventanaEmergenteModificarProducto(); }); //Selecciona el boton recien agregado al DOM y le da la funcion cuando se le hace click en el
            }
        };
        cursorPeticion.onerror = () => { ventanaEmergente("Error al cargar los productos"); };
    }
    //Funcion para el boton de seleccionar productos para que aparezcan o no en la seccion de seleccion de productos
    function productosdbAlternarSeleccionarProducto(productoId) {
        let cursorPeticion = db.transaction([`productos`], `readwrite`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tipoSeleccionado)); //Selecciona el cursor para recorrer el almacen de productos filtrados por tipo y modificarlo
        cursorPeticion.onsuccess = (event) => {
            let cursor = event.target.result; //Selecciona el cursor para poder recorrer los productos hallados
            if (cursor) { //Comienza con la busqueda del producto
                let producto = cursor.value; //Contiene al objeto encontrado
                if (producto.id === productoId) { //Si lo encuetra...
                    if (producto.seleccionado === "true") { //Y si estaba seleccionado...
                        producto.seleccionado = "false"; //Entonces lo alterna 
                    }
                    else { // Y si no estaba seleccionado
                        producto.seleccionado = "true"; //Lo deja seleccionado
                    }
                    let peticionActualizar = cursor.update(producto); //Actualiza la base de datos
                    peticionActualizar.onsuccess = () => {
                    };
                    peticionActualizar.onerror = () => {
                        ventanaEmergente("No se pudo modificar el producto");
                    };
                }
                else { //Si no lo encuentra...
                    cursor.continue(); //Continua con los siguientes objetos
                }
            }
        };
        cursorPeticion.onerror = () => {
            ventanaEmergente("No se pudo abrir la base de datos correctamente");
        };
    }
    //Funcion para eliminar productos de la base de datos
    function productosdbEliminarProducto(productoId) {
        ventanaEmergente(0).then(respuesta => {
            if (respuesta) {
                let solicitudEliminar = db.transaction([`productos`], `readwrite`).objectStore(`productos`).delete(productoId); //Abre la base de datos para eliminar el producto con el id recibido como argumento
                solicitudEliminar.onerror = () => { ventanaEmergente("No se pudo eliminar el producto"); };
                buscarTipos(); //Actualiza el contenedor de productos para reflejar los cambios
            }
        });
    }
    //Funcion que alterna el color del fondo en los momentos donde hay ventanas emergentes
    function alternarFondoVentanaEmergente() {
        let fondo = document.getElementById("ventanaEmergenteFondo");
        let ventanaEmergenteModificarProducto = document.getElementById("ventanaEmergenteModificarProducto");
        fondo.classList.toggle("ventanaEmergenteFondo-active"); //Alterna el activa del fondo oscuro de la pantalla emergente
        ventanaEmergenteModificarProducto.classList.toggle("ventanaEmergenteModificarProducto-active");
    }
    //Ventanas emergentes para confirmaciones del usuario o errores
    function ventanaEmergente(error, alternaFondo = true) {
        return new Promise((resolve) => {
            let mensaje = document.getElementById("ventanaEmergente__contenido__mensaje");
            let fondo = document.getElementById("ventanaEmergenteFondo");
            let botonAceptar = document.getElementById("ventanaEmergente__contenido__aceptar__boton");
            let botonRechazar = document.getElementById("ventanaEmergente__contenido__rechazar__boton");
            let ventana = document.getElementById("ventanaEmergente");
            ventana.classList.toggle("ventanaEmergente-active"); //Muestra la ventana
            botonAceptar.onclick = () => {
                if (alternaFondo) {
                    fondo.classList.toggle("ventanaEmergenteFondo-active");
                } //Alterna el fondo oscuro
                ventana.classList.toggle("ventanaEmergente-active"); //Esconde la ventana
                resolve(true);
            };
            botonRechazar.onclick = () => {
                if (alternaFondo) {
                    fondo.classList.toggle("ventanaEmergenteFondo-active");
                } //Alterna el fondo oscuro
                ventana.classList.toggle("ventanaEmergente-active"); //Esconde la ventana
                resolve(false);
            };
            if (alternaFondo) {
                fondo.classList.toggle("ventanaEmergenteFondo-active");
            } //Alterna el fondo oscuro
            switch (error) { //Se ponen distintos casos de error
                case 0:
                    mensaje.textContent = "¿Esta seguro que quiere eliminar este producto?";
                    break;
                default:
                    if (typeof error === "number") {
                        mensaje.textContent = `Error desconocido (${error})`; //Si se pasa como argumento un codigo de error no especificado se estipula
                    }
                    else {
                        mensaje.textContent = error; //Si se pasa un mensaje de error como argumento se lo muestra en pantalla
                    }
                    break;
            }
        });
    }
    //Ventana emergente para modificar o agregar un producto de la base de datos
    function ventanaEmergenteModificarProducto(productoId) {
        let aceptar = document.getElementById("ventanaEmergenteModificarProducto__contenido__AceptarRechazar__aceptar");
        let rechazar = document.getElementById("ventanaEmergenteModificarProducto__contenido__AceptarRechazar__rechazar");
        //Selecciona los input en donde el usuario agregara las diferentes caracteristicas del producto
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
        tipo.value = tipoSeleccionado;
        categoria.value = categoriaSeleccionada;
        alternarFondoVentanaEmergente();
        if (!(productoId === undefined)) { //Si a la funcion se le paso un ID de un producto entonces la funcion es para modificarlo un producto
            //Realiza una peticion para recorrer el almacen y modificar el almacen, filtrado por el tipo seleccionado
            let cursorPeticion = db.transaction([`productos`], `readwrite`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tipoSeleccionado));
            cursorPeticion.onsuccess = (event) => {
                let cursor = event.target.result; //Selecciona el cursor para poder recorrer los productos hallados
                if (cursor) { //Comienza con la busqueda del producto
                    let producto = cursor.value; //Contiene al objeto encontrado
                    if (producto.id === productoId) { //Si lo encuetra un objeto con el mismo id que el buscado...
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
                    }
                    else { //Si no lo encuentra...
                        cursor.continue(); //Continua con los siguientes objetos
                    }
                }
            };
            cursorPeticion.onerror = () => {
                ventanaEmergente("No se pudo abrir la base de datos correctamente");
            };
        }
        return new Promise((resolve) => {
            aceptar.onclick = () => {
                //Verifica la informacion ingreada por el usuario
                let verificado = false;
                if (isNaN(Number(precio.value))) {
                    ventanaEmergente("El precio ingresado no es valido", false);
                }
                else if (isNaN(Number(stock.value))) {
                    ventanaEmergente("El stock ingresado no es valido", false);
                }
                else if (isNaN(Number(codigoBarra.value))) {
                    ventanaEmergente("El codigo de barra ingresado no es valido", false);
                }
                else {
                    verificado = true;
                }
                if (verificado) { //Si la informacion ingresada tiene el formato correcto entonces se sigue con la ejecucion...
                    let productoNuevo; //Aca se va a almacenar el producto nuevo o modificado
                    if (!(productoId === undefined)) { //Si a la funcion se le paso un ID de un producto entonces la funcion es para modificarlo
                        let peticionActualizarProducto = db.transaction([`productos`], `readwrite`).objectStore(`productos`).get(productoId); // Selecciona el almacen de objetos correcto y selecciona el producto a modificar
                        peticionActualizarProducto.onsuccess = (event) => {
                            productoNuevo = event.target.result; //Selecciona el producto.
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
                            let peticionModificar = db.transaction([`productos`], `readwrite`).objectStore(`productos`).put(productoNuevo); // Remplaza el producto en la base de datos o lo crea si no existe
                            peticionModificar.onsuccess = () => {
                                cargarproductosdb();
                                alternarFondoVentanaEmergente();
                                resolve(true);
                            };
                            peticionModificar.onerror = () => {
                                ventanaEmergente("Error al modificar");
                            };
                        };
                        peticionActualizarProducto.onerror = () => {
                            ventanaEmergente("Error al actualizar producto"); //Le da un error al usuario
                        };
                    }
                    else { //Si la funcion es para agregar producto entonces...
                        productoNuevo = {
                            foto: ``,
                            nombre: `${nombre.value}`,
                            id: `${id.value}`,
                            precio: Number(precio.value),
                            stock: Number(stock.value),
                            tipo: `${tipo.value}`,
                            categoria: `${categoria.value}`,
                            color: color.value,
                            codigoBarra: Number(codigoBarra.value),
                            promocionable: `${promocionable.value}`,
                            descripcion: `${descripcion.value}`,
                            orden: 0,
                            seleccionado: "true"
                        };
                        let peticionModificar = db.transaction([`productos`], `readwrite`).objectStore(`productos`).put(productoNuevo); // Remplaza el producto en la base de datos o lo crea si no existe
                        peticionModificar.onsuccess = () => {
                            alternarFondoVentanaEmergente();
                            cargarproductosdb();
                            resolve(true);
                        };
                        peticionModificar.onerror = () => {
                            ventanaEmergente("Error al modificar");
                        };
                    }
                }
            };
            rechazar.onclick = () => {
                alternarFondoVentanaEmergente();
                cargarproductosdb();
                resolve(false);
            };
        });
    }
    //Carga y le da funciones a la barra lateral
    document.getElementById("barraLateral_A__icono").addEventListener("click", () => {
        document.getElementById("contenedorConfiguracionProductos").scrollIntoView();
    });
    document.getElementById("barraLateral_A__nombre").addEventListener("click", () => {
        document.getElementById("contenedorConfiguracionProductos").scrollIntoView();
    });
    document.getElementById("barraLateral_B__icono").addEventListener("click", () => {
        document.getElementById("seleccionProductos").scrollIntoView();
    });
    document.getElementById("barraLateral_B__nombre").addEventListener("click", () => {
        document.getElementById("seleccionProductos").scrollIntoView();
    });
    document.getElementById("barraLateral_C__icono").addEventListener("click", () => {
        document.getElementById("seleccionExtra").scrollIntoView();
    });
    document.getElementById("barraLateral_C__nombre").addEventListener("click", () => {
        document.getElementById("seleccionExtra").scrollIntoView();
    });
    //Carga el area de seleccion de productos
    document.getElementById("barraLateral_B__icono").onclick = () => {
        cargarSeleccionProductos();
    };
    document.getElementById("barraLateral_B__nombre").onclick = () => {
        cargarSeleccionProductos();
    };
    //Carga la seccion de seleccion de productos, se ejecuta cada vez que se hace click sobre la barra lateral para desplazarse a este mismo
    function cargarSeleccionProductos() {
        let contenedorIndiceTipos = document.getElementById("seleccionProductos");
        contenedorIndiceTipos.innerHTML = ``; //Vacia la seccion por si habia elementos cargados previamente
        buscarTiposSeleccionados().then(tiposSeleccionados => {
            const fragmento = document.createDocumentFragment();
            let numeroTipo = 1;
            tiposSeleccionados.forEach(tipo => {
                const titulo = document.createElement("div");
                titulo.classList.add("seleccionProductos__indiceTitulo");
                titulo.textContent = tipo;
                const indiceTipo = document.createElement("div"); //Y crea un div para cada tipo
                indiceTipo.appendChild(titulo);
                indiceTipo.classList.add("seleccionProductos__indice");
                indiceTipo.id = `seleccionProductos__indiceTipo${numeroTipo}`;
                numeroTipo++;
                buscarProductosSeleccionados(tipo).then(productosSeleccionados => {
                    productosSeleccionados.forEach(producto => {
                        let productoCreado = document.createElement("div");
                        productoCreado.classList.add("seleccionProducto");
                        productoCreado.innerHTML = `
                        <button class="seleccionSumarProducto">${producto.nombre}</button>
                        <button class="seleccionRestarProducto">-</button>
                        <div class="seleccionCantidad">0</div>
                        <div class="seleccionStock">${producto.stock}</div>
                        `;
                        indiceTipo.appendChild(productoCreado); //Agrega el producto encontrado al contenedor del mismo tipo
                    });
                });
                fragmento.appendChild(indiceTipo); //Agrega el tipo, con todos los productos que cumplen dicho tipo, al fragmento
            });
            contenedorIndiceTipos.appendChild(fragmento); //Agrega todos los elementos cargados al DOM
            //A continuacion se les da las funciones a todos los botones
            setTimeout(() => {
                document.querySelectorAll(".seleccionProducto").forEach(conjuntoBotones => {
                    let botonSumar = conjuntoBotones.children[0];
                    let botonRestar = conjuntoBotones.children[1];
                    let cantidad = conjuntoBotones.children[2];
                    let stock = conjuntoBotones.children[3];
                    botonSumar.addEventListener("click", () => {
                        cantidad.textContent = `${Number(cantidad.textContent) + 1}`;
                        stock.textContent = `${Number(stock.textContent) - 1}`;
                        if (Number(cantidad.textContent) == 0) {
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }
                        else if (Number(cantidad.textContent) < 0) {
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                            cantidad.classList.add("seleccionCantidad-active2");
                        }
                        else {
                            cantidad.classList.add("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }
                    });
                    botonRestar.addEventListener("click", () => {
                        cantidad.textContent = `${Number(cantidad.textContent) - 1}`;
                        stock.textContent = `${Number(stock.textContent) + 1}`;
                        if (Number(cantidad.textContent) == 0) {
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }
                        else if (Number(cantidad.textContent) < 0) {
                            cantidad.classList.remove("seleccionCantidad-active");
                            cantidad.classList.add("seleccionCantidad-active2");
                        }
                        else {
                            cantidad.classList.add("seleccionCantidad-active");
                            cantidad.classList.remove("seleccionCantidad-active2");
                        }
                    });
                });
            }, 10);
        });
    }
    //Busca los tipos que tengan productos seleccionados
    function buscarTiposSeleccionados() {
        //Se busca los diferentes "tipos" que hay en la base de datos que esten seleccionados
        return new Promise((resolve) => {
            let tiposSeleccionadosEncontrados = ["Vacio"]; //Crea un array vacio para guardar todos los tipos encontrados
            let peticionCursor = db.transaction([`productos`], `readonly`).objectStore(`productos`).index(`porSeleccion`).openCursor(IDBKeyRange.only("true")); //Abre el almacen filtrado por los productos seleccionado
            peticionCursor.onsuccess = (event) => {
                let cursorTiposSeleccionados = event.target.result;
                if (cursorTiposSeleccionados) { //Recorre el cursor 
                    let tipoEncontrado = false;
                    if (tiposSeleccionadosEncontrados[0] === "Vacio") {
                        tiposSeleccionadosEncontrados[0] = cursorTiposSeleccionados.value.tipo;
                    } //Si el array esta vacio entonces coloca como primer elemento el primer tipo del primer producto encontrado
                    else { //Si tiene tipos encontrados entonces los recorre para buscar nuevos y agregarlos
                        tiposSeleccionadosEncontrados.forEach(tipoSeleccionado => {
                            if (tipoSeleccionado === cursorTiposSeleccionados.value.tipo) { //Verifica si el tipo actual se encuentra en el array de tipos encontrados
                                tipoEncontrado = true; //Si lo encuentra se deja constancia
                            }
                        });
                        if (!tipoEncontrado) {
                            tiposSeleccionadosEncontrados.push(cursorTiposSeleccionados.value.tipo);
                        } //Si despues de recorrer el array de tipos encontrados no se encontro el tipo que se esta evaluando entonces lo agrega
                    }
                    cursorTiposSeleccionados.continue(); //Se sigue con el siguiente tipo
                }
                else { //Una vez que se termina de buscar...
                    resolve(tiposSeleccionadosEncontrados);
                }
            };
        });
    }
    //Funcion que se le pasa como parametro el "tipo" y busca los productos con ese "tipo" y que esten seleccionados para mostrarse
    function buscarProductosSeleccionados(tipo) {
        //Se busca los diferentes productos que esten seleccionados para un tipo especifico
        return new Promise((resolve) => {
            let productosSeleccionadosEncontrados = []; //Crea un array para guardar todos los productos encontrados
            let peticionCursor = db.transaction([`productos`], `readonly`).objectStore(`productos`).index(`porTipo`).openCursor(IDBKeyRange.only(tipo)); //Abre una peticion para abrir un cursor para recorrer el almacen filtrado por el tipo recibido como parametro
            peticionCursor.onsuccess = (event) => {
                let cursorProductosFiltrados = event.target.result;
                if (cursorProductosFiltrados) { //Recorre el cursor  
                    if (cursorProductosFiltrados.value.seleccionado === "true") { //Almacena el producto filtrado que este seleccionado
                        if (productosSeleccionadosEncontrados === undefined) {
                            productosSeleccionadosEncontrados = cursorProductosFiltrados.value;
                        } //Si el array esta vacio coloca el primer producto como el primer elemento 
                        else {
                            productosSeleccionadosEncontrados.push(cursorProductosFiltrados.value);
                        }
                    }
                    cursorProductosFiltrados.continue(); //Se sigue con el siguiente tipo
                }
                else { //Una vez que se termina de buscar...
                    resolve(productosSeleccionadosEncontrados);
                }
            };
        });
    }
});
//# sourceMappingURL=index.js.map