// Helpers compartidos por la página de reportes y la previsualización de
// exportaciones. Una sola definición evita que la vista previa y el archivo
// descargado muestren totales distintos.

// Agrupa cantidades por unidad: sumar kilogramos con unidades daría un total
// sin significado físico. Devuelve, por ejemplo, "12.50 KILOGRAMO + 3.00 UNIDAD".
export const desgloseUnidadesPorProducto = (productos) => {
  if (!productos?.length) return '—';
  const porUnidad = {};
  for (const p of productos) {
    const u = p.unidad || '—';
    porUnidad[u] = (porUnidad[u] || 0) + (parseFloat(p.cantidadVendida) || 0);
  }
  return Object.entries(porUnidad)
    .map(([u, v]) => `${v.toFixed(2)} ${u}`)
    .join(' + ');
};

// Suma un campo numérico tolerando valores vacíos o con formato de texto
// (SQLite puede devolver decimales como string).
export const sumarCampo = (lista, campo) =>
  (lista || []).reduce((acc, item) => acc + (parseFloat(item?.[campo]) || 0), 0);
