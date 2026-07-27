// =====================================================
// MODULO: PEDIDOS  (con abonos, modal y responsive)
// =====================================================

let diaSeleccionado = null;
let abonoCliente = null, abonoDia = null, abonoMetodo = null;

function renderProductosPedido() {
  const cont = document.getElementById('lista-productos-pedido');
  cont.innerHTML = '';
  productos.forEach(p => {
    const cant = carrito[p.id] || 0;
    cont.innerHTML +=
      '<div class="producto-fila">' +
        '<div class="info">' + p.nombre + '<br><small>' + formatoPesos(p.precio) + '</small></div>' +
        '<div class="contador">' +
          '<button onclick="cambiarCantidad(' + p.id + ', -1)">−</button>' +
          '<span id="cant-' + p.id + '">' + cant + '</span>' +
          '<button onclick="cambiarCantidad(' + p.id + ', 1)">+</button>' +
        '</div>' +
      '</div>';
  });
  actualizarTotal();
}

function cambiarCantidad(id, delta) {
  carrito[id] = Math.max(0, (carrito[id] || 0) + delta);
  document.getElementById('cant-' + id).textContent = carrito[id];
  actualizarTotal();
}

function actualizarTotal() {
  let total = 0;
  productos.forEach(p => { total += (carrito[p.id] || 0) * p.precio; });
  document.getElementById('total-pedido').textContent = formatoPesos(total);
}

function guardarPedido() {
  const cliente = document.getElementById('cliente').value.trim();
  if (!cliente) { alert("Escribe el nombre del cliente"); return; }

  const items = [];
  let total = 0;
  productos.forEach(p => {
    const cant = carrito[p.id] || 0;
    if (cant > 0) {
      items.push({ nombre: p.nombre, cantidad: cant, precio: p.precio });
      total += cant * p.precio;
    }
  });
  if (items.length === 0) { alert("Agrega al menos un producto"); return; }

  pedidos.unshift({
    id: Date.now(), cliente: cliente, items: items, total: total,
    fecha: new Date().toLocaleString('es-CO'),
    estado: 'pendiente', pago: 'pendiente', metodoPago: null, abonos: []
  });

  agregarClienteSiNoExiste(cliente);
  guardarDatos();
  carrito = {};
  document.getElementById('cliente').value = '';
  alert("Pedido guardado con exito");
  renderProductosPedido();
}

function generarResumenWhatsApp() {
  const cliente = document.getElementById('cliente').value.trim() || "Cliente";
  let texto = "Pedido de " + cliente + "\n\n";
  let total = 0;
  productos.forEach(p => {
    const cant = carrito[p.id] || 0;
    if (cant > 0) {
      const sub = cant * p.precio;
      total += sub;
      texto += "- " + cant + " x " + p.nombre + " = " + formatoPesos(sub) + "\n";
    }
  });
  texto += "\nTOTAL: " + formatoPesos(total);
  if (navigator.clipboard) { navigator.clipboard.writeText(texto); }
  alert("Resumen copiado. Pegalo en WhatsApp:\n\n" + texto);
}

// =====================================================
// VISTA POR FECHAS
// =====================================================

function renderPedidos() {
  const contFechas = document.getElementById('lista-fechas');
  const contDetalle = document.getElementById('detalle-dia');
  contDetalle.innerHTML = '';
  diaSeleccionado = null;

  if (pedidos.length === 0) { contFechas.innerHTML = '<p>No hay pedidos todavia.</p>'; return; }

  const fechasUnicas = {};
  pedidos.forEach(ped => {
    const soloDia = ped.fecha.split(',')[0].trim();
    if (!fechasUnicas[soloDia]) fechasUnicas[soloDia] = [];
    fechasUnicas[soloDia].push(ped);
  });

  contFechas.innerHTML = '<p>Selecciona una fecha para ver sus pedidos:</p>';
  Object.keys(fechasUnicas).forEach(dia => {
    const cantidad = fechasUnicas[dia].length;
    contFechas.innerHTML +=
      '<button class="btn-fecha" onclick="mostrarPedidosDelDia(\'' + dia + '\')">📅 ' + dia + ' (' + cantidad + ')</button>';
  });
}

function mostrarPedidosDelDia(dia) {
  const contDetalle = document.getElementById('detalle-dia');
  if (diaSeleccionado === dia) { contDetalle.innerHTML = ''; diaSeleccionado = null; return; }
  diaSeleccionado = dia;

  const pedidosDelDia = pedidos.filter(ped => ped.fecha.split(',')[0].trim() === dia);

  const grupos = {};
  pedidosDelDia.forEach(ped => {
    if (!grupos[ped.cliente]) grupos[ped.cliente] = [];
    grupos[ped.cliente].push(ped);
  });

  let html = '<h3>Pedidos del ' + dia + '</h3>';
  html += '<table class="tabla-pedidos">';
  html += '<tr class="fila-encabezado"><th>Cliente</th><th>Arepas</th><th>Valor a pagar</th><th>Pago</th><th>Estado</th><th>Acciones</th></tr>';

  let totalDia = 0;

  Object.keys(grupos).forEach(cliente => {
    const lista = grupos[cliente];
    const combinado = {};
    let totalCliente = 0, pagadoCliente = 0;
    lista.forEach(ped => {
      totalCliente += ped.total;
      pagadoCliente += pagadoDe(ped);
      ped.items.forEach(i => { combinado[i.nombre] = (combinado[i.nombre] || 0) + i.cantidad; });
    });
    totalDia += totalCliente;
    const saldoCliente = totalCliente - pagadoCliente;
    const arepas = Object.keys(combinado).map(n => combinado[n] + ' x ' + n).join('<br>');

    let pagoTxt, pagoClase;
    if (pagadoCliente === 0) { pagoTxt = 'Pendiente'; pagoClase = 'debe'; }
    else if (saldoCliente <= 0) {
      const metodos = [...new Set(lista.flatMap(p => (p.abonos || []).map(a => a.metodo)))];
      pagoTxt = metodos.length ? metodos.join(', ') : 'Pagado'; pagoClase = 'pagado';
    } else {
      pagoTxt = 'Abono ' + formatoPesos(pagadoCliente) + ' · Debe ' + formatoPesos(saldoCliente);
      pagoClase = 'abonado';
    }

    const sinEntregar = lista.filter(p => p.estado !== 'entregado');
    const entregados  = lista.filter(p => p.estado === 'entregado');
    let estadoTxt, estadoClase;
    if (sinEntregar.length === 0) { estadoTxt = 'Entregado'; estadoClase = 'entregado'; }
    else if (entregados.length === 0) { estadoTxt = 'Pendiente'; estadoClase = 'pendiente'; }
    else { estadoTxt = 'Parcial'; estadoClase = 'pendiente'; }

    const c = cliente.replace(/'/g, "\\'");

    html += '<tr>' +
      '<td data-label="Cliente">' + cliente + '</td>' +
      '<td data-label="Arepas">' + arepas + '</td>' +
      '<td data-label="Valor">' + formatoPesos(totalCliente) + '</td>' +
      '<td data-label="Pago"><span class="badge ' + pagoClase + '">' + pagoTxt + '</span></td>' +
      '<td data-label="Estado"><span class="badge ' + estadoClase + '">' + estadoTxt + '</span></td>' +
      '<td data-label="Acciones">' +
        '<button class="btn-mini" onclick="entregarCliente(\'' + c + '\', \'' + dia + '\')">✅ Entregar</button>' +
        '<button class="btn-mini" onclick="abonarCliente(\'' + c + '\', \'' + dia + '\')">💵 Abonar</button>' +
        '<button class="btn-eliminar" onclick="eliminarClienteDia(\'' + c + '\', \'' + dia + '\')">🗑️ Borrar</button>' +
      '</td>' +
    '</tr>';
  });

  html += '<tr class="fila-total"><td colspan="2"><strong>TOTAL DEL DIA</strong></td>' +
          '<td colspan="4"><strong>' + formatoPesos(totalDia) + '</strong></td></tr>';
  html += '</table>';
  contDetalle.innerHTML = html;
}

// =====================================================
// ACCIONES POR CLIENTE + DIA
// =====================================================

function pedidosDeClienteDia(cliente, dia) {
  return pedidos.filter(p => p.cliente === cliente && p.fecha.split(',')[0].trim() === dia);
}

function refrescarDiaAbierto() {
  const d = diaSeleccionado;
  diaSeleccionado = null;
  if (d) mostrarPedidosDelDia(d);
}

function entregarCliente(cliente, dia) {
  const grupo = pedidosDeClienteDia(cliente, dia);
  const hayPendientes = grupo.some(p => p.estado !== 'entregado');
  grupo.forEach(p => p.estado = hayPendientes ? 'entregado' : 'pendiente');
  guardarDatos();
  refrescarDiaAbierto();
}

function valorNumerico(str) { return parseInt((str || '').replace(/\D/g, '')) || 0; }

function formatearPesosInput(input) {
  const num = valorNumerico(input.value);
  input.value = num === 0 ? '' : '$' + num.toLocaleString('es-CO');
}

function seleccionarMetodo(btn) {
  document.querySelectorAll('.btn-metodo').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
  abonoMetodo = btn.dataset.metodo;
}

function cerrarModalAbono() {
  document.getElementById('modal-abono').classList.remove('abierto');
}

function abonarCliente(cliente, dia) {
  const grupo = pedidosDeClienteDia(cliente, dia);
  const totalGrupo  = grupo.reduce((s, p) => s + p.total, 0);
  const pagadoGrupo = grupo.reduce((s, p) => s + pagadoDe(p), 0);
  const saldo = totalGrupo - pagadoGrupo;

  if (saldo <= 0) {
    if (confirm(cliente + ' ya pago todo (' + formatoPesos(totalGrupo) + ').\n\n¿Deseas BORRAR sus pagos y dejarlo como Pendiente?')) {
      grupo.forEach(p => { p.abonos = []; p.pago = 'pendiente'; p.metodoPago = null; });
      guardarDatos();
      refrescarDiaAbierto();
    }
    return;
  }

  abonoCliente = cliente; abonoDia = dia; abonoMetodo = null;

  document.getElementById('modal-info').innerHTML =
    '<strong>' + cliente + '</strong> debe <strong>' + formatoPesos(saldo) + '</strong>';
  document.getElementById('modal-monto').value = '$' + saldo.toLocaleString('es-CO');
  document.querySelectorAll('.btn-metodo').forEach(b => b.classList.remove('activo'));
  document.getElementById('modal-abono').classList.add('abierto');
}

function confirmarAbono() {
  const grupo = pedidosDeClienteDia(abonoCliente, abonoDia);
  const totalGrupo  = grupo.reduce((s, p) => s + p.total, 0);
  const pagadoGrupo = grupo.reduce((s, p) => s + pagadoDe(p), 0);
  const saldo = totalGrupo - pagadoGrupo;

  let monto = valorNumerico(document.getElementById('modal-monto').value);
  if (monto <= 0) { alert('Escribe un monto valido.'); return; }
  if (monto > saldo) monto = saldo;
  if (!abonoMetodo) { alert('Selecciona un metodo de pago (Efectivo, Nequi o Daviplata).'); return; }

  let restante = monto;
  grupo.forEach(p => {
    if (restante <= 0) return;
    const s = saldoDe(p);
    if (s <= 0) return;
    const aplicar = Math.min(restante, s);
    if (!p.abonos) p.abonos = [];
    p.abonos.push({ monto: aplicar, metodo: abonoMetodo });
    restante -= aplicar;
  });
  grupo.forEach(p => { p.pago = saldoDe(p) <= 0 ? 'pagado' : 'pendiente'; });

  guardarDatos();
  cerrarModalAbono();
  refrescarDiaAbierto();
}

function eliminarClienteDia(cliente, dia) {
  const grupo = pedidosDeClienteDia(cliente, dia);
  if (confirm('Eliminar los ' + grupo.length + ' pedido(s) de "' + cliente + '" del ' + dia + '?')) {
    pedidos = pedidos.filter(p => !(p.cliente === cliente && p.fecha.split(',')[0].trim() === dia));
    guardarDatos();
    renderPedidos();
  }
}