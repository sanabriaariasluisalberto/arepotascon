// =====================================================
// MODULO: DB (datos en la NUBE con Firebase)
// =====================================================

// Productos de fabrica (si la nube esta vacia por primera vez)
const PRODUCTOS_DEFAULT = [
  { id: 1, nombre: "Arepa Sencilla (paq. x10)", precio: 10000 },
  { id: 2, nombre: "Arepa con Queso (paq. x10)", precio: 15000 },
  { id: 3, nombre: "Arepa con Jamon y Queso (paq. x10)", precio: 20000 },
  { id: 4, nombre: "Arepa con Bocadillo y Queso (paq. x10)", precio: 20000 }
];

// Variables compartidas por todos los modulos
let productos = [];
let pedidos = [];
let clientes = [];
let carrito = {};

let docRef = null; // referencia al documento en la nube

// ----- Utilidades -----
function formatoPesos(n) { return "$" + (n || 0).toLocaleString('es-CO'); }

function pagadoDe(ped) {
  if (!ped.abonos) return ped.pago === 'pagado' ? ped.total : 0;
  return ped.abonos.reduce((s, a) => s + a.monto, 0);
}
function saldoDe(ped) { return ped.total - pagadoDe(ped); }

// Asegura que los datos tengan el formato correcto (abonos y clientes)
function normalizarDatos() {
  pedidos.forEach(p => {
    if (!p.abonos) {
      p.abonos = [];
      if (p.pago === 'pagado') p.abonos.push({ monto: p.total, metodo: p.metodoPago || 'Efectivo' });
    }
  });
  pedidos.forEach(p => {
    if (p.cliente && !clientes.some(c => c.toLowerCase() === p.cliente.toLowerCase())) {
      clientes.push(p.cliente);
    }
  });
}

// Vuelve a dibujar la pestana que este abierta en ese momento
function refrescarVistaActual() {
  const activa = document.querySelector('.tab-content.active');
  const id = activa ? activa.id : 'nuevo';
  if (id === 'nuevo') renderProductosPedido();
  else if (id === 'pedidos') renderPedidos();
  else if (id === 'clientes') renderClientes();
  else if (id === 'productos-tab') renderProductosAdmin();
  else if (id === 'reportes') renderReportes();
}

// ----- GUARDAR en la NUBE (y respaldo local por si acaso) -----
function guardarDatos() {
  try {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('clientes', JSON.stringify(clientes));
  } catch (e) {}

  if (!docRef) return;
  docRef.set({
    productos: JSON.stringify(productos),
    pedidos: JSON.stringify(pedidos),
    clientes: JSON.stringify(clientes),
    actualizado: new Date().toLocaleString('es-CO')
  }).catch(err => console.error('Error guardando en la nube:', err));
}

// ----- INICIAR conexion con la nube -----
function iniciarDatos() {
  // Si por algo Firebase no cargo, usamos memoria local (modo de respaldo)
  if (typeof dbFirebase === 'undefined') {
    productos = JSON.parse(localStorage.getItem('productos')) || PRODUCTOS_DEFAULT.slice();
    pedidos   = JSON.parse(localStorage.getItem('pedidos'))   || [];
    clientes  = JSON.parse(localStorage.getItem('clientes'))  || [];
    normalizarDatos();
    refrescarVistaActual();
    return;
  }

  docRef = dbFirebase.collection('datos').doc('principal');

  // Escuchamos la nube EN VIVO: si algo cambia, se actualiza solo
  docRef.onSnapshot(function (doc) {
    if (doc.exists) {
      const d = doc.data();
      productos = d.productos ? JSON.parse(d.productos) : PRODUCTOS_DEFAULT.slice();
      pedidos   = d.pedidos   ? JSON.parse(d.pedidos)   : [];
      clientes  = d.clientes  ? JSON.parse(d.clientes)  : [];
    } else {
      // Primera vez: usamos lo que haya local o los productos de fabrica
      productos = JSON.parse(localStorage.getItem('productos')) || PRODUCTOS_DEFAULT.slice();
      pedidos   = JSON.parse(localStorage.getItem('pedidos'))   || [];
      clientes  = JSON.parse(localStorage.getItem('clientes'))  || [];
      guardarDatos();
    }
    normalizarDatos();
    refrescarVistaActual();
  }, function (error) {
    console.error('Error de conexion con la nube:', error);
    alert('⚠️ No se pudo conectar con la nube. Revisa tu internet e intenta recargar.');
  });
}

// Arrancamos cuando toda la pagina ya cargo
window.addEventListener('load', iniciarDatos);