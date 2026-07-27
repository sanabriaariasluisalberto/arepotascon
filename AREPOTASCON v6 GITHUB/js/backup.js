// =====================================================
// MODULO: BACKUP (Copia de seguridad)
// Exporta e importa productos, pedidos Y clientes.
// =====================================================

// ---- EXPORTAR: crea un archivo .json con todo ----
function exportarDatos() {
  // 1) Juntamos TODO lo que queremos guardar
  const respaldo = {
    productos: productos,
    pedidos: pedidos,
    clientes: clientes,                              // NUEVO: tambien la lista de clientes
    fecha_respaldo: new Date().toLocaleString('es-CO')
  };

  // 2) Lo convertimos a texto bonito (formato JSON)
  const texto = JSON.stringify(respaldo, null, 2);

  // 3) Creamos un archivo temporal y lo descargamos
  const blob = new Blob([texto], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  const hoy = new Date();
  enlace.download = 'respaldo-arepas-' + hoy.getFullYear() + '-' +
                    (hoy.getMonth() + 1) + '-' + hoy.getDate() + '.json';
  enlace.click();
  URL.revokeObjectURL(url);

  alert('✅ Respaldo creado. Guarda este archivo en tu carpeta o tablet.');
}

// ---- IMPORTAR: lee un archivo .json y carga los datos ----
function importarDatos(input) {
  const archivo = input.files[0];
  if (!archivo) return; // no eligio nada

  const lector = new FileReader();
  lector.onload = function (e) {
    try {
      // 1) Convertimos el texto del archivo de vuelta a datos
      const datos = JSON.parse(e.target.result);

      // 2) Validamos que el archivo tenga lo que esperamos
      if (!datos.productos || !datos.pedidos) {
        alert('❌ Este archivo no parece un respaldo valido de Arepas.');
        return;
      }

      // 3) Preguntamos antes de reemplazar (para no borrar por error)
      const confirmar = confirm(
        '⚠️ Esto reemplazara TODOS los datos actuales con los del archivo.\n\n' +
        'Respaldo del: ' + (datos.fecha_respaldo || 'fecha desconocida') + '\n\n' +
        '¿Deseas continuar?'
      );
      if (!confirmar) return;

      // 4) Cargamos los datos y los guardamos en el navegador
      productos = datos.productos;
      pedidos = datos.pedidos;
      clientes = datos.clientes || [];                // NUEVO: cargamos clientes (o lista vacia si no vienen)
      guardarDatos();

      alert('✅ Datos importados con exito. Se vera reflejado al instante.');

      // 5) Redibujamos lo que este a la vista
      renderProductosPedido();
      if (typeof renderClientes === 'function') renderClientes();
      if (typeof renderReportes === 'function') renderReportes();

    } catch (error) {
      alert('❌ Hubo un error leyendo el archivo. ¿Seguro que es un respaldo .json?');
    }
  };
  lector.readAsText(archivo);

  // Limpiamos el input para poder importar el mismo archivo otra vez si hace falta
  input.value = '';
}