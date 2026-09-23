/* =========================================================================
   2. SELECCIÓN DE ELEMENTOS DEL DOM (Actualizado)
   ========================================================================= */
// Reemplazamos panelBoleta por cuerpoHistorial
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
const cuerpoHistorial = document.getElementById("cuerpo-historial"); // <-- NUEVO
const avisoConexion  = document.getElementById("aviso-conexion");
const btnTema        = document.getElementById("btn-tema");

/* ... (Todo tu código del bloque 3, 4, 5, 6 y 7 se mantiene intacto) ... */


/* =========================================================================
   8. INICIALIZACIÓN Y EVENTOS DE COMPRA (Actualizado)
   ========================================================================= */

    // 8.7. Formulario de compra
    const manejarCompra = function (evento) {
        // REQUERIMIENTO 2: Interceptación del formulario (se evita recarga de página)
        evento.preventDefault();

        if (carrito.length === 0) {
            mostrarMensaje("Tu carrito está vacío", "error");
            return;
        }

        const nombreCliente = inputNombre.value;
        const correoCliente = inputCorreo.value;

        if (nombreCliente.length < 3) {
            mostrarMensaje("Escribe tu nombre completo (mínimo 3 letras)", "error");
            return;
        }

        const totales = calcularTotales();
        numeroPedido++;

        // Invocamos la nueva lógica de tabla
        agregarRegistroHistorial(numeroPedido, nombreCliente, correoCliente, totales);

        // Reiniciamos el estado de la compra
        carrito = [];
        porcentajeDescuento = 0;
        envioGratisPorCupon = false;
        inputDescuento.value = "";
        inputNombre.value = "";
        inputCorreo.value = "";

        mostrarMensaje(`Pedido #${numeroPedido} confirmado`, "exito");
        actualizarPantalla();
    };
    formCompra.addEventListener("submit", manejarCompra);

    
    // REQUERIMIENTO 4 Y 5: Generación e inyección de registros (Nodos DOM)
    // Se fabrica la fila dinámicamente y se anexa al final sin borrar las anteriores
    function agregarRegistroHistorial(pedido, nombreCliente, correoCliente, totales) {
        // Fabricación de nodos DOM
        const fila = document.createElement("tr");

        const celdaPedido = document.createElement("td");
        celdaPedido.textContent = `#${pedido}`;
        fila.appendChild(celdaPedido);

        const celdaCliente = document.createElement("td");
        celdaCliente.textContent = `${nombreCliente} (${correoCliente})`;
        fila.appendChild(celdaCliente);

        const celdaTotal = document.createElement("td");
        celdaTotal.textContent = formatearPrecio(totales.total);
        // Resaltamos visualmente el total
        celdaTotal.style.fontWeight = "bold"; 
        celdaTotal.style.color = "var(--color-primario)";
        fila.appendChild(celdaTotal);

        // Inyección y persistencia
        cuerpoHistorial.appendChild(fila);
    }


    // 8.9. Función autoejecutable
    (function iniciarTienda() {
        console.log("Iniciando la tienda...");
        actualizarPantalla();

        window.addEventListener("offline", () => {
            avisoConexion.classList.remove("oculto");
        });

        window.addEventListener("online", () => {
            avisoConexion.classList.add("oculto");
            mostrarMensaje("Conexión restaurada", "exito");
        });

        // NOTA: Asegúrate de que la variable "inventarioProductos" esté declarada globalmente arriba como en tu código original.
    })();