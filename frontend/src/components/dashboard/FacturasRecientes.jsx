import React from 'react';
import { Link } from 'react-router-dom';
import { Utils } from '../../services/api';

const badgeEstado = (estado) => {
  if (estado === 'PAID') return <span className="badge badge-success">Pagada</span>;
  if (estado === 'PENDING') return <span className="badge badge-warning">Pendiente</span>;
  if (estado === 'PARTIALLY_PAID') return <span className="badge badge-info">Abonada</span>;
  return <span className="badge badge-danger">Anulada</span>;
};

const numero = (factura) => `#${String(factura.numeroFactura).padStart(5, '0')}`;

/**
 * Últimas facturas. Tolera `facturas` ausente o no-array: es el punto donde
 * antes se rompía el dashboard cuando la API fallaba.
 */
export function FacturasRecientes({ facturas, moneda }) {
  const lista = Array.isArray(facturas) ? facturas : [];

  return (
    <div className="card dash-card">
      <div className="dash-card-head">
        <div>
          <h3 className="dash-h3">Facturas Recientes</h3>
          <p className="dash-sub">Últimos comprobantes emitidos</p>
        </div>
        {/* La ruta real del listado de facturas es /ventas; /facturas no existe
            y el enlace dejaba al usuario en una pantalla en blanco. */}
        <Link to="/ventas" className="dash-link">Ver todas →</Link>
      </div>

      {lista.length === 0 ? (
        <p className="dash-empty">No hay facturas recientes</p>
      ) : (
        <>
          {/* Escritorio y tablet: tabla */}
          <div className="table-wrapper dash-tabla">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="num">Monto total</th>
                  <th className="center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((factura) => (
                  <tr key={factura.id}>
                    <td className="mono strong">{numero(factura)}</td>
                    <td>
                      <div className="dash-cliente">{factura.cliente?.razonSocial}</div>
                      <div className="dash-rif">{factura.cliente?.rifCedula}</div>
                    </td>
                    <td className="dash-fecha">{Utils.formatDate(factura.fechaEmision)}</td>
                    <td className="num mono strong">{Utils.formatMoney(factura.total, moneda)}</td>
                    <td className="center">{badgeEstado(factura.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Teléfono: fichas compactas (más facturas por pantalla) */}
          <ul className="dash-facturas">
            {lista.map((factura) => (
              <li key={factura.id} className="dash-factura">
                <div className="dash-factura-top">
                  <span className="mono strong">{numero(factura)}</span>
                  {badgeEstado(factura.estado)}
                </div>
                <div className="dash-factura-cliente">{factura.cliente?.razonSocial}</div>
                <div className="dash-factura-meta">
                  <span>{Utils.formatDate(factura.fechaEmision)}</span>
                  <strong className="mono">{Utils.formatMoney(factura.total, moneda)}</strong>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default FacturasRecientes;
