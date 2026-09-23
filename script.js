/* =========================================================================
   1. VARIABLES Y TIPOS DE DATOS 
   ========================================================================= */
const manzana   = { id: 1, nombre: "manzana", categoria: "fruta",   precio: 1000,  stock: 8,  icono: "images/manzana.jpg" };
const pina      = { id: 2, nombre: "pina",        categoria: "fruta",   precio: 2000, stock: 5,  icono: "images/pina.jpg" };
const pera      = { id: 3, nombre: "pera",        categoria: "fruta",   precio: 1200,  stock: 12, icono: "images/pera.jpg" };
const melon     = { id: 4, nombre: "melon",       categoria: "fruta",   precio: 3000,  stock: 3,  icono: "images/melon.jpg" };
const zanahoria = { id: 5, nombre: "zanahoria",   categoria: "verdura", precio: 500,   stock: 14, icono: "images/zanahoria.jpg" };
const tomate    = { id: 6, nombre: "tomate",      categoria: "verdura", precio: 400,  stock: 0,  icono: "images/tomate.jpg" };
const jugo      = { id: 7, nombre: "jugo",        categoria: "bebida",  precio: 1300,  stock: 6,  icono: "images/jugo.jpg" };
const cocoAgua  = { id: 8, nombre: "aguaCoco",    categoria: "bebida",  precio: 5000,   stock: 4,  icono: "images/aguaCoco.jpg" };
const agua     = { id: 9, nombre: "agua",        categoria: "bebida",  precio: 1200,   stock: 10, icono: "images/agua.jpg" };
const brocoli   = { id: 10, nombre: "brocoli",     categoria: "verdura", precio: 2300,   stock: 7,  icono: "images/brocoli.jpg" };
const fresa     = { id: 11, nombre: "fresa",       categoria: "fruta",   precio: 1900,  stock: 9,  icono: "images/fresa.jpg" };
const lechuga   = { id: 12, nombre: "lechuga",     categoria: "verdura", precio: 1400,   stock: 11, icono: "images/lechuga.jpg" };
const inventarioProductos = [manzana, pina, pera, melon, zanahoria, tomate, jugo, cocoAgua, agua, brocoli, fresa, lechuga];

const COSTO_ENVIO = 8;
const MINIMO_ENVIO_GRATIS = 60;
const MINIMO_CUPON_MITAD = 100;

let carrito = [];               
let porcentajeDescuento = 0;    
let envioGratisPorCupon = false;
let categoriaActual = "todos";  
let temaOscuro = false;         
let numeroPedido = 1000;        
let temporizadorMensaje = null; 

/* =========================================================================
   2. SELECCIÓN DE ELEMENTOS DEL DOM
   ========================================================================= */
const contenedorProductos = document.getElementById("lista-productos");
const contenedorCarrito   = document.getElementById("items-carrito");
const contadorCarrito     = document.getElementById("contador-carrito");
const textoSubtotal = document.getElementById("texto-subtotal");
const textoEnvio    = document.getElementById("texto-envio");
const textoTotal    = document.getElementById("texto-total");
const mensajeSistema = document.getElementById("mensaje-sistema");
const textoDescuento = document.getElementById("texto-descuento");
const lineaDescuento = document.getElementById("linea-descuento");
const inputDescuento  = document.getElementById("input-descuento");
const btnDescuento    = document.getElementById("btn-aplicar-descuento");
const selectCategoria = document.getElementById("filtro-categoria");
const formCompra  = document.getElementById("form-compra");
const inputNombre = document.getElementById("input-nombre");
const inputCorreo = document.getElementById("input-correo");
const cuerpoHistorial = document.getElementById("cuerpo-historial"); // NODO DEL PROYECTO 2
const avisoConexion  = document.getElementById("aviso-conexion");
const btnTema        = document.getElementById("btn-tema");

/* =========================================================================
   3. FUNCIONES AUXILIARES
   ========================================================================= */
const formatearPrecio = (valor) => `$${valor.toFixed(2)}`;

function buscarProductoPorId(idProducto) {
   return inventarioProductos.find(producto => producto.id === idProducto) || null;
}

function buscarItemEnCarrito(idProducto) {
   return carrito.find(item => item.id === idProducto) || null;
}

const carritoSinProducto = (idProducto) => {
    return carrito.filter(item => item.id !== idProducto);
};

const contarUnidades = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
};

const calcularTotales = () => {
    let subtotal = 0;
    carrito.forEach((item) => subtotal += (item.precio * item.cantidad));
    const descuento = subtotal * porcentajeDescuento;
    const envio = (carrito.length === 0 || envioGratisPorCupon || subtotal - descuento >= MINIMO_ENVIO_GRATIS) ? 0 : COSTO_ENVIO;
    const total = subtotal - descuento + envio;

    return { subtotal, descuento, envio, total };
};

function renderizarResumen() {
    const totales = calcularTotales();
    textoSubtotal.textContent = formatearPrecio(totales.subtotal);
    textoTotal.textContent = formatearPrecio(totales.total);
    contadorCarrito.textContent = contarUnidades();

    if (totales.descuento > 0) {
        textoDescuento.textContent = `- ${formatearPrecio(totales.descuento)}`;
        lineaDescuento.classList.remove("oculto");
    } else {
        lineaDescuento.classList.add("oculto");
    }
    textoEnvio.textContent = (totales.envio === 0) ? "Gratis" : formatearPrecio(totales.envio);
}

/* =========================================================================
   4. DIBUJAR EL CATÁLOGO (Imágenes y Botones Interactivos)
   ========================================================================= */
function renderizarProductos() {
    contenedorProductos.innerHTML = ""; 

    inventarioProductos.forEach((producto) => {
        const coincideFiltro = (categoriaActual === "todos" || producto.categoria === categoriaActual);
        
        if (coincideFiltro) {
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta");

            let textoStock = "";
            if (producto.stock === 0) {
                textoStock = "Agotado";
                tarjeta.classList.add("agotada");
            } else if (producto.stock <= 3) {
                textoStock = `¡Últimas ${producto.stock}!`;
                tarjeta.classList.add("poco-stock");
            } else {
                textoStock = `Disponibles: ${producto.stock}`;
            }

            const itemEnCarrito = buscarItemEnCarrito(producto.id);
            const textoEnCarrito = (itemEnCarrito === null) ? "" : `En carrito: ${itemEnCarrito.cantidad}`;

            tarjeta.innerHTML = `
                <span class="icono-producto">
                    <!-- Truco: Si no encuentra la imagen, muestra un color gris -->
                    <img src="${producto.icono}" alt="${producto.nombre}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; background: #eee;" onerror="this.style.display='none'">
                </span>
                <h3 class="nombre-producto" style="text-transform: capitalize;">${producto.nombre}</h3>
                <p class="etiqueta-categoria">${producto.categoria}</p>
                <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
                <p class="estado-stock">${textoStock}</p>
                <p class="mini-dato" style="font-weight: bold;">${textoEnCarrito}</p>
            `;
            const botonComprar = document.createElement("button");
            botonComprar.classList.add("boton", "boton-bloque");

            if (producto.stock === 0) {
                botonComprar.textContent = "Sin existencias";
                botonComprar.disabled = true;
            } else {
                botonComprar.textContent = "Agregar al carrito";
                botonComprar.addEventListener("click", () => agregarAlCarrito(producto.id));
            }
            tarjeta.appendChild(botonComprar);
            contenedorProductos.appendChild(tarjeta);
        }
    });
}

/* =========================================================================
   5. LÓGICA DE COMPRA
   ========================================================================= */
const agregarAlCarrito = (idProducto) => {
    const producto = buscarProductoPorId(idProducto);

    if (producto.stock > 0) {
        const item = buscarItemEnCarrito(idProducto);
        if (item === null) {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                icono: producto.icono,
                cantidad: 1
            });
        } else {
            item.cantidad++;
        }
        producto.stock--;
        mostrarMensaje(`${producto.nombre} agregado al carrito`, "exito");
        actualizarPantalla();
    } else {
        mostrarMensaje(`No queda inventario de ${producto.nombre}`, "error");
    }
};

function cambiarCantidad(idProducto, cambio) {
    const item = buscarItemEnCarrito(idProducto);
    const producto = buscarProductoPorId(idProducto);

    if (cambio === 1) {
        if (producto.stock > 0) {
            item.cantidad++;
            producto.stock--;
        } else {
            mostrarMensaje(`No hay más ${producto.nombre}`, "error");
        }
    } else {
        item.cantidad--;
        producto.stock++;
        if (item.cantidad === 0) {
            carrito = carritoSinProducto(idProducto);
        }
    }
    actualizarPantalla();
}

function quitarDelCarrito(idProducto) {
    const item = buscarItemEnCarrito(idProducto);
    const producto = buscarProductoPorId(idProducto);
    producto.stock += item.cantidad;
    carrito = carritoSinProducto(idProducto);
    mostrarMensaje(`${producto.nombre} eliminado`, "error");
    actualizarPantalla();
}

/* =========================================================================
   6. DIBUJAR EL CARRITO Y ACTUALIZAR
   ========================================================================= */
const renderizarCarrito = function () {
    contenedorCarrito.innerHTML = ""; 

    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.classList.add("carrito-vacio");
        vacio.textContent = "Tu carrito está vacío. Agrega productos.";
        contenedorCarrito.appendChild(vacio);
        return; 
    }

    carrito.forEach((item) => {
        const linea = document.createElement("div");
        linea.classList.add("linea-carrito");

        const info = document.createElement("div");
        info.innerHTML = `
            <p class="nombre-linea" style="text-transform: capitalize;">${item.nombre}</p>
            <p class="detalle-linea">${item.cantidad} x ${formatearPrecio(item.precio)} = ${formatearPrecio(item.precio * item.cantidad)}</p>
        `;

        const controles = document.createElement("div");
        controles.classList.add("controles-linea");

        const btnMenos = document.createElement("button");
        btnMenos.classList.add("boton-mini");
        btnMenos.textContent = "-";
        btnMenos.addEventListener("click", () => cambiarCantidad(item.id, -1));

        const btnMas = document.createElement("button");
        btnMas.classList.add("boton-mini");
        btnMas.textContent = "+";
        btnMas.addEventListener("click", () => cambiarCantidad(item.id, 1));

        const btnQuitar = document.createElement("button");
        btnQuitar.classList.add("boton-mini", "boton-quitar");
        btnQuitar.textContent = "X";
        btnQuitar.addEventListener("click", () => quitarDelCarrito(item.id));

        controles.appendChild(btnMenos);
        controles.appendChild(btnMas);
        controles.appendChild(btnQuitar);

        linea.appendChild(info);
        linea.appendChild(controles);
        contenedorCarrito.appendChild(linea);
    });
};

function actualizarPantalla() {
    renderizarProductos();
    renderizarCarrito();
    renderizarResumen();
}

/* =========================================================================
   7. MENSAJES DEL SISTEMA
   ========================================================================= */
function mostrarMensaje(texto, tipo) {
    mensajeSistema.textContent = texto;
    mensajeSistema.classList.remove("oculto", "mensaje-exito", "mensaje-error");

    if (tipo === "exito") mensajeSistema.classList.add("mensaje-exito");
    else if (tipo === "error") mensajeSistema.classList.add("mensaje-error");

    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => {
        mensajeSistema.classList.add("oculto");
    }, 3000);
}

/* =========================================================================
   8. EVENTOS Y TABLA DE HISTORIAL REQUERIMIENTO 4 Y 5
   ========================================================================= */
const aplicarCupon = function () {
    const codigo = inputDescuento.value.toUpperCase();
    const totales = calcularTotales();

    if (carrito.length === 0) {
        mostrarMensaje("Agrega productos antes de usar un cupón", "info");
        return;
    }

    switch (codigo) {
        case "DESCUENTO10":
            porcentajeDescuento = 0.10;
            envioGratisPorCupon = false;
            mostrarMensaje("Cupón aplicado: 10% de descuento", "exito");
            break;
        case "MITAD":
            if (totales.subtotal >= MINIMO_CUPON_MITAD) {
                porcentajeDescuento = 0.50;
                envioGratisPorCupon = false;
                mostrarMensaje("Cupón aplicado: 50% de descuento", "exito");
            } else {
                porcentajeDescuento = 0;
                mostrarMensaje(`El cupón MITAD necesita compra mínima de ${formatearPrecio(MINIMO_CUPON_MITAD)}`, "error");
            }
            break;
        case "ENVIOGRATIS":
            porcentajeDescuento = 0;
            envioGratisPorCupon = true;
            mostrarMensaje("Cupón aplicado: envío gratis", "exito");
            break;
        default:
            porcentajeDescuento = 0;
            envioGratisPorCupon = false;
            mostrarMensaje("Ese código no existe o ya venció", "error");
    }
    renderizarResumen();
};

btnDescuento.addEventListener("click", aplicarCupon);
inputDescuento.addEventListener("keydown", (e) => { if (e.key === "Enter") aplicarCupon(); });

selectCategoria.addEventListener("change", () => {
    categoriaActual = selectCategoria.value;
    renderizarProductos();
});

btnTema.addEventListener("click", () => {
    temaOscuro = !temaOscuro;
    if (temaOscuro) {
        document.body.classList.add("tema-oscuro");
        btnTema.textContent = "Modo claro";
    } else {
        document.body.classList.remove("tema-oscuro");
        btnTema.textContent = "Modo oscuro";
    }
});

// HISTORIAL DE COMPRAS REQUERIMIENTO 4
const manejarCompra = function (evento) {
    evento.preventDefault(); 

    if (carrito.length === 0) {
        mostrarMensaje("Tu carrito está vacío", "error");
        return;
    }

    const nombreCliente = inputNombre.value;
    const correoCliente = inputCorreo.value;
//CONTROL DE FORMULARIO REQUERIMIENTO 3
    if (nombreCliente.length < 3) {
        mostrarMensaje("Escribe tu nombre completo", "error");
        return;
    }
    const totales = calcularTotales();
    numeroPedido++;
    agregarRegistroHistorial(numeroPedido, nombreCliente, correoCliente, totales);
    carrito = [];
    porcentajeDescuento = 0;
    envioGratisPorCupon = false;
    inputDescuento.value = "";
    inputNombre.value = "";
    inputCorreo.value = "";

    mostrarMensaje(`Pedido #${numeroPedido} confirmado exitosamente`, "exito");
    actualizarPantalla();
};

formCompra.addEventListener("submit", manejarCompra);
//REQUERIMIENTO 5: Inyección de filas
function agregarRegistroHistorial(pedido, nombreCliente, correoCliente, totales) {
    const fila = document.createElement("tr");

    const celdaPedido = document.createElement("td");
    celdaPedido.textContent = `#${pedido}`;
    fila.appendChild(celdaPedido);

    const celdaCliente = document.createElement("td");
    celdaCliente.textContent = `${nombreCliente} (${correoCliente})`;
    fila.appendChild(celdaCliente);

    const celdaTotal = document.createElement("td");
    celdaTotal.textContent = formatearPrecio(totales.total);
    celdaTotal.style.fontWeight = "bold"; 
    celdaTotal.style.color = "var(--color-primario)";
    fila.appendChild(celdaTotal);
    cuerpoHistorial.appendChild(fila);
}

(function iniciarTienda() {
    console.log("Iniciando la tienda...");
    actualizarPantalla();
    window.addEventListener("offline", () => avisoConexion.classList.remove("oculto"));
    window.addEventListener("online", () => {
        avisoConexion.classList.add("oculto");
        mostrarMensaje("Conexión restaurada", "exito");
    });
})();