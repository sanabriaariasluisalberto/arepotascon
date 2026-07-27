// =====================================================
// MODULO: CLIENTES
// Muestra una LISTA de clientes frecuentes (solo el nombre).
// Al hacer clic en un nombre, abre "Nuevo Pedido" con ese
// cliente ya escrito, listo para armar su pedido.
// =====================================================

function renderClientes() {
  const cont = document.getElementById('lista-clientes');
  cont.innerHTML = '';

  if (clientes.length === 0) {
    cont.innerHTML = '<p>No hay clientes todavia. Se agregaran solos cuando guardes un pedido con un nombre nuevo.</p>';
    return;
  }

  // Recorremos los clientes ordenados alfabeticamente
  clientes.slice().sort().forEach(nombre => {
    const nombreSeguro = nombre.replace(/'/g, "\\'"); // por si el nombre tiene apostrofe
    cont.innerHTML +=
      '<div class="cliente-item">' +
        '<button class="btn-cliente" onclick="seleccionarCliente(\'' + nombreSeguro + '\')">👤 ' + nombre + '</button>' +
        '<button class="btn-eliminar" onclick="eliminarCliente(\'' + nombreSeguro + '\')">🗑️</button>' +
      '</div>';
  });
}

// ---- Al tocar un cliente: ponemos su nombre y vamos a Nuevo Pedido ----
function seleccionarCliente(nombre) {
  document.getElementById('cliente').value = nombre;             // escribimos el nombre
  document.querySelector('.tab-btn[data-tab="nuevo"]').click();  // cambiamos a Nuevo Pedido
}

// ---- Quita un cliente de la lista de frecuentes ----
function eliminarCliente(nombre) {
  if (confirm('Quitar a "' + nombre + '" de la lista de clientes?')) {
    clientes = clientes.filter(c => c !== nombre);
    guardarDatos();
    renderClientes();
  }
}

// ---- Agrega un cliente SOLO si no existe (se usa al guardar un pedido) ----
function agregarClienteSiNoExiste(nombre) {
  const existe = clientes.some(c => c.toLowerCase() === nombre.toLowerCase());
  if (!existe) {
    clientes.push(nombre);
    guardarDatos();
  }
}
