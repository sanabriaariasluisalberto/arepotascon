// =====================================================
// MODULO: APP (Navegacion)
// Controla el cambio entre los modulos/pestanas.
// Es como el "controlador" que decide que se muestra.
// =====================================================

// A cada boton de pestana le agregamos un evento de clic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // 1) Quitamos la marca 'active' de todos los botones y secciones
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // 2) Activamos el boton que se hizo clic y su seccion correspondiente
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');

    // 3) Llamamos a la funcion que dibuja el contenido de esa pestana
    if (btn.dataset.tab === 'pedidos') renderPedidos();
    if (btn.dataset.tab === 'nuevo') renderProductosPedido();
    if (btn.dataset.tab === 'clientes') renderClientes();
    if (btn.dataset.tab === 'productos-tab') renderProductosAdmin();
    if (btn.dataset.tab === 'reportes') renderReportes();
  });
});

// Al abrir la app, mostramos por defecto los productos del Nuevo Pedido
renderProductosPedido();