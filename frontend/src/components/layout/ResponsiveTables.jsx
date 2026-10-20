import { useEffect } from 'react';

/**
 * Adapta todas las tablas del área de trabajo a "tarjetas" en móvil.
 *
 * Copia el texto de la cabecera (`<thead><th>`) de cada columna al atributo
 * `data-label` de cada celda (`<td>`) de su misma posición, y marca la tabla
 * con la clase `rt-cards`. El CSS (movil.css) hace el resto: en ≤767px la
 * tabla se apila como tarjetas; en escritorio no cambia nada.
 *
 * No altera datos, columnas ni funciones: sólo añade atributos de presentación.
 * Las filas de estado vacío (con `colspan`) se respetan tal cual.
 */
export function ResponsiveTables({ rootId = 'main-content' }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    let raf = 0;

    const labelTables = () => {
      raf = 0;
      const tables = root.querySelectorAll('table');
      tables.forEach((table) => {
        const headers = Array.from(table.querySelectorAll(':scope > thead > tr > th')).map(
          (th) => th.textContent.trim()
        );
        if (headers.length === 0) return;

        table.classList.add('rt-cards');

        // Se etiquetan las filas del cuerpo y también las del pie (`tfoot`),
        // como la fila «Total General» de Reportes. El índice de columna se
        // lleva aparte para respetar los `colspan`.
        table.querySelectorAll(':scope > tbody > tr, :scope > tfoot > tr').forEach((tr) => {
          let col = 0;
          Array.from(tr.children).forEach((cell) => {
            if (cell.tagName !== 'TD') return;
            const span = parseInt(cell.getAttribute('colspan') || '1', 10) || 1;
            if (span > 1) {
              cell.removeAttribute('data-label');
              col += span;
              return;
            }
            cell.setAttribute('data-label', headers[col] || '');
            col += 1;
          });
        });
      });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(labelTables);
    };

    // Primera pasada + reconciliación ante cambios de React (filas nuevas,
    // paginación, filtros). `data-label` es un atributo, y el observador no
    // vigila atributos, así que no se retroalimenta.
    labelTables();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [rootId]);

  return null;
}
