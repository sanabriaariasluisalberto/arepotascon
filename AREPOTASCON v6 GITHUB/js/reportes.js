// =====================================================
// MODULO: REPORTES (por dia, con abonos y responsive)
// =====================================================

let diaReporteAbierto = null;

function renderReportes() {
  const cont = document.getElementById('contenido-reportes');
  if (pedidos.length === 0) { cont.innerHTML = '<p>No hay ventas todavia.</p>'; return; }

  const totalVentas = pedidos.reduce((s, p) => s + p.total, 0);
  const cobrado     = pedidos.reduce((s, p) => s + pagadoDe(p), 0);
  const porCobrar   = pedidos.reduce((s, p) => s + saldoDe(p), 0);

  let html = '';
  html += '<div class="reporte-item">💰 Total en ventas (todo): <strong>' + formatoPesos(totalVentas) + '</strong></div>';
  html += '<div class="reporte-item">✅ Dinero cobrado (todo): <strong>' + formatoPesos(cobrado) + '</strong></div>';
  html += '<div class="reporte-item">🔴 Por cobrar (todo): <strong>' + formatoPesos(porCobrar) + '</strong></div>';

  const fechasUnicas = {};
  pedidos.forEach(ped => {
    const soloDia = ped.fecha.split(',')[0].trim();
    if (!fechasUnicas[soloDia]) fechasUnicas[soloDia] = [];
    fechasUnicas[soloDia].push(ped);
  });

  html += '<h3 style="margin-top:20px;color:#d35400;">📅 Ver reporte por dia:</h3>';
  html += '<div id="botones-reporte-dia">';
  Object.keys(fechasUnicas).forEach(dia => {
    const cantidad = fechasUnicas[dia].length;
    html += '<button class="btn-fecha" onclick="mostrarReporteDelDia(\'' + dia + '\')">📅 ' + dia + ' (' + cantidad + ')</button>';
  });
  html += '</div>';
  html += '<div id="detalle-reporte-dia"></div>';

  cont.innerHTML = html;
  diaReporteAbierto = null;
}

function mostrarReporteDelDia(dia) {
  const contDetalle = document.getElementById('detalle-reporte-dia');
  if (diaReporteAbierto === dia) { contDetalle.innerHTML = ''; diaReporteAbierto = null; return; }
  diaReporteAbierto = dia;

  const pedidosDelDia = pedidos.filter(ped => ped.fecha.split(',')[0].trim() === dia);

  let totalDia = 0, porEfectivo = 0, porNequi = 0, porDaviplata = 0;
  const deudaPorCliente = {};

  pedidosDelDia.forEach(ped => {
    totalDia += ped.total;
    (ped.abonos || []).forEach(a => {
      if (a.metodo === 'Efectivo')  porEfectivo  += a.monto;
      else if (a.metodo === 'Nequi')     porNequi     += a.monto;
      else if (a.metodo === 'Daviplata') porDaviplata += a.monto;
    });
    const s = saldoDe(ped);
    if (s > 0) deudaPorCliente[ped.cliente] = (deudaPorCliente[ped.cliente] || 0) + s;
  });

  const totalCobradoDia = porEfectivo + porNequi + porDaviplata;
  const totalDeudaDia = Object.values(deudaPorCliente).reduce((s, v) => s + v, 0);

  let html = '<h3 style="margin-top:15px;">Reporte del ' + dia + '</h3>';
  html += '<div class="reporte-item">💰 Total vendido del dia: <strong>' + formatoPesos(totalDia) + '</strong></div>';

  html += '<h4 style="margin:15px 0 8px;color:#d35400;">💳 Cobrado por metodo de pago:</h4>';
  html += '<table class="tabla-pedidos">';
  html += '<tr class="fila-encabezado"><th>Metodo</th><th>Total</th></tr>';
  html += '<tr><td data-label="Metodo">💵 Efectivo</td><td data-label="Total">' + formatoPesos(porEfectivo) + '</td></tr>';
  html += '<tr><td data-label="Metodo">📱 Nequi</td><td data-label="Total">' + formatoPesos(porNequi) + '</td></tr>';
  html += '<tr><td data-label="Metodo">📲 Daviplata</td><td data-label="Total">' + formatoPesos(porDaviplata) + '</td></tr>';
  html += '<tr class="fila-total"><td><strong>Total cobrado</strong></td><td><strong>' + formatoPesos(totalCobradoDia) + '</strong></td></tr>';
  html += '</table>';

  html += '<h4 style="margin:15px 0 8px;color:#c0392b;">🔴 Quien debe este dia:</h4>';
  const nombresDeudores = Object.keys(deudaPorCliente);
  if (nombresDeudores.length === 0) {
    html += '<div class="reporte-item">🎉 Nadie debe este dia. Todo cobrado.</div>';
  } else {
    html += '<table class="tabla-pedidos">';
    html += '<tr class="fila-encabezado"><th>Cliente</th><th>Debe</th></tr>';
    nombresDeudores.forEach(n => {
      html += '<tr><td data-label="Cliente">' + n + '</td><td data-label="Debe">' + formatoPesos(deudaPorCliente[n]) + '</td></tr>';
    });
    html += '<tr class="fila-total"><td><strong>Total por cobrar</strong></td><td><strong>' + formatoPesos(totalDeudaDia) + '</strong></td></tr>';
    html += '</table>';
  }

  contDetalle.innerHTML = html;
}