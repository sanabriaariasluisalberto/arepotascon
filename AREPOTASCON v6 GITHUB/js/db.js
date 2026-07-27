// =====================================================
// MODULO: DB (Capa de datos compartida)
// =====================================================

// Lista de PRODUCTOS (menu inicial por defecto)
let productos = JSON.parse(localStorage.getItem('productos')) || [
  { id: 1, nombre: "Arepa Sencilla (paq. x10)", precio: 10000 },
  { id: 2, nombre: "Arepa con Queso (paq. x10)", precio: 15000 },
  { id: 3, nombre: "Arepa con Jamon y Queso (paq. x10)", precio: 20000 },
  { id: 4, nombre: "Arepa con Bocadillo y Queso (paq. x10)", precio: 20000 }
];

// Lista de PEDIDOS realizados
let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

// Lista de CLIENTES frecuentes (solo nombres)
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

// Carrito temporal del pedido que se esta armando
let carrito = {};

// Guarda todo en el navegador para que no se pierda
function guardarDatos() {
  localStorage.setItem('productos', JSON.stringify(productos));
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Convierte un numero a pesos colombianos. Ej: 15000 -> "$15.000"
function formatoPesos(n) {
  return "$" + (n || 0).toLocaleString('es-CO');
}

// ===== AYUDAS DE ABONOS (pagos parciales) =====
// Cuanto se ha PAGADO de un pedido (suma de sus abonos)
function pagadoDe(ped) {
  if (!ped.abonos) return ped.pago === 'pagado' ? ped.total : 0;
  return ped.abonos.reduce((s, a) => s + a.monto, 0);
}
// Cuanto FALTA por pagar de un pedido
function saldoDe(ped) {
  return ped.total - pagadoDe(ped);
}

// ===== MIGRACIONES (se corren una sola vez) =====

// 1) Pasar clientes que ya tienen pedidos a la lista de frecuentes
if (!localStorage.getItem('clientesMigrados')) {
  pedidos.forEach(p => {
    if (p.cliente && !clientes.some(c => c.toLowerCase() === p.cliente.toLowerCase())) {
      clientes.push(p.cliente);
    }
  });
  localStorage.setItem('clientes', JSON.stringify(clientes));
  localStorage.setItem('clientesMigrados', 'si');
}

// 2) Darle a cada pedido su lista de abonos.
//    Si ya estaba 'pagado', creamos un abono por el total con su metodo.
if (!localStorage.getItem('abonosMigrados')) {
  pedidos.forEach(p => {
    if (!p.abonos) {
      p.abonos = [];
      if (p.pago === 'pagado') {
        p.abonos.push({ monto: p.total, metodo: p.metodoPago || 'Efectivo' });
      }
    }
  });
  guardarDatos();
  localStorage.setItem('abonosMigrados', 'si');
}