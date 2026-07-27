// =====================================================
// MODULO: PRODUCTOS
// Permite ver, agregar, EDITAR y eliminar productos del menu.
// =====================================================

// Guarda el id del producto que se esta editando (o null si ninguno)
let productoEditando = null;

// ---- Dibuja la lista de productos ----
function renderProductosAdmin() {
  const cont = document.getElementById('lista-productos-admin');
  cont.innerHTML = '';

  productos.forEach(p => {
    if (productoEditando === p.id) {
      // ----- MODO EDICION: mostramos campos para cambiar nombre y precio -----
      cont.innerHTML +=
        '<div class="producto-fila">' +
          '<div class="info" style="width:100%;">' +
            '<input type="text" id="edit-nombre-' + p.id + '" value="' + p.nombre.replace(/"/g, '&quot;') + '">' +
            '<input type="number" id="edit-precio-' + p.id + '" value="' + p.precio + '">' +
            '<button class="btn-mini" onclick="guardarEdicionProducto(' + p.id + ')">💾 Guardar</button>' +
            '<button class="btn-eliminar" onclick="cancelarEdicionProducto()">✖ Cancelar</button>' +
          '</div>' +
        '</div>';
    } else {
      // ----- MODO NORMAL: mostramos el producto con botones Editar y Eliminar -----
      cont.innerHTML +=
        '<div class="producto-fila">' +
          '<div class="info">' + p.nombre + '<br><small>' + formatoPesos(p.precio) + '</small></div>' +
          '<div>' +
            '<button class="btn-mini" onclick="editarProducto(' + p.id + ')">✏️ Editar</button>' +
            '<button class="btn-eliminar" onclick="eliminarProducto(' + p.id + ')">🗑️ Eliminar</button>' +
          '</div>' +
        '</div>';
    }
  });
}

// ---- Activa el modo edicion de un producto ----
function editarProducto(id) {
  productoEditando = id;
  renderProductosAdmin();
}

// ---- Cancela la edicion sin guardar ----
function cancelarEdicionProducto() {
  productoEditando = null;
  renderProductosAdmin();
}

// ---- Guarda los cambios del producto que se esta editando ----
function guardarEdicionProducto(id) {
  const nombre = document.getElementById('edit-nombre-' + id).value.trim();
  const precio = parseInt(document.getElementById('edit-precio-' + id).value);

  if (!nombre || !precio || precio <= 0) {
    alert('Escribe un nombre y un precio validos.');
    return;
  }

  // Buscamos el producto y le cambiamos nombre y precio
  const prod = productos.find(p => p.id === id);
  prod.nombre = nombre;
  prod.precio = precio;

  guardarDatos();
  productoEditando = null;   // salimos del modo edicion
  renderProductosAdmin();    // redibujamos la lista
  alert('Producto actualizado');
}

// ---- Agrega un producto nuevo tomando nombre y precio del formulario ----
function agregarProducto() {
  const nombre = document.getElementById('nuevo-nombre').value.trim();
  const precio = parseInt(document.getElementById('nuevo-precio').value);

  if (!nombre || !precio) { alert("Escribe nombre y precio validos"); return; }

  productos.push({ id: Date.now(), nombre: nombre, precio: precio });
  guardarDatos();

  document.getElementById('nuevo-nombre').value = '';
  document.getElementById('nuevo-precio').value = '';
  renderProductosAdmin();
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