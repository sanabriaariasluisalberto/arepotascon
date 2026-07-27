// =====================================================
// MODULO: PRODUCTOS
// Permite ver, agregar y eliminar productos del menu.
// =====================================================

// ---- Dibuja la lista de productos con boton de eliminar ----
function renderProductosAdmin() {
  const cont = document.getElementById('lista-productos-admin');
  cont.innerHTML = ''; // limpiamos
  productos.forEach(p => {
    cont.innerHTML += '<div class="producto-fila"><div class="info"><strong>' + p.nombre +
      '</strong><br>' + formatoPesos(p.precio) + '</div>' +
      '<button class="btn-eliminar" onclick="eliminarProducto(' + p.id + ')">Eliminar</button></div>';
  });
}

// ---- Agrega un producto nuevo tomando nombre y precio del formulario ----
function agregarProducto() {
  const nombre = document.getElementById('nuevo-nombre').value.trim();
  const precio = parseInt(document.getElementById('nuevo-precio').value); // texto -> numero
  if (!nombre || !precio) { alert("Escribe nombre y precio validos"); return; } // validacion
  productos.push({ id: Date.now(), nombre: nombre, precio: precio }); // lo agregamos
  guardarDatos();
  // Limpiamos el formulario
  document.getElementById('nuevo-nombre').value = '';
  document.getElementById('nuevo-precio').value = '';
  renderProductosAdmin(); // redibujamos la lista
  alert("Producto agregado");
}

// ---- Elimina un producto por su id ----
function eliminarProducto(id) {
  if (confirm("Eliminar este producto?")) {
    productos = productos.filter(p => p.id !== id);
    guardarDatos();
    renderProductosAdmin();
  }
}
