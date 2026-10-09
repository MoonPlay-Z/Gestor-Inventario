import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import closeIcon from '@iconify/icons-mdi/close';
import { Utils } from '../../services/api';

const fmtVES = (n) => `Bs. ${Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUSD = (n) => `$${Number(n || 0).toFixed(2)}`;

function VerificadoCard({ icon, titulo, subtitulo, registrado, lotesLabel, lotes, setLotes, contravalor, verificado, setVerificado, diferencia }) {
  const conc = Math.abs(diferencia) < 0.01;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-secondary)', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon icon={icon} className="h-5 w-5" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{titulo}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{subtitulo}</div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(22,163,74,0.12)', color: 'var(--success)', fontWeight: 700 }}>
          {conc ? '✓ Cuadrado' : 'Pendiente'}
        </span>
      </div>
      <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>Registrado en Sistema:</span><strong>{Utils.formatMoney(registrado)}</strong>
      </div>
      <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>{lotesLabel}:</span>
        <input type="number" min="0" value={lotes} onChange={e => setLotes(e.target.value)} style={{ width: 70, textAlign: 'right', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'rgba(22,163,74,0.08)', color: 'var(--success)', fontWeight: 700 }} />
      </div>
      <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>Contravalor BCV:</span><strong>{Utils.formatMoney(contravalor)}</strong>
      </div>
      <label style={{ fontSize: 11, fontWeight: 700 }}>Monto Verificado en Banco: <span style={{ color: 'var(--success)' }}>⊙ Conciliado</span></label>
      <input type="number" step="0.01" value={verificado} onChange={e => setVerificado(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `2px solid ${conc ? 'var(--success)' : 'var(--danger)'}`, fontWeight: 800, fontSize: 16 }} />
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>Diferencia:</span>
        <strong style={{ color: conc ? 'var(--success)' : 'var(--danger)' }}>{conc ? `${Utils.formatMoney(0)} (Exacto)` : Utils.formatMoney(diferencia)}</strong>
      </div>
    </div>
  );
}

function ArqueoCard({ moneda, simbolo, color, fondoInicial, ventas, monedaVentas, esVES, vueltos, setVueltos, retiros, setRetiros, gastos, setGastos, esperado, contado, setContado,tasa }) {
  const contadoNum = parseFloat(contado) || 0;
  const conc = Math.abs(contadoNum - esperado) < 0.01;
  const fmt = esVES ? fmtVES : fmtUSD;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 999, background: color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{simbolo}</span>
        <div>
          <div style={{ fontWeight: 700 }}>Efectivo {esVES ? 'Bolívares (VES)' : 'Dólares (USD)'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Custodia física de {esVES ? 'papel moneda local' : 'billetes USD'}</div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(22,163,74,0.12)', color: 'var(--success)', fontWeight: 700 }}>
          {conc ? `✓ Cuadrado (${fmt(0)})` : '⚠ Pendiente'}
        </span>
      </div>
      <Row label={`▷ Fondo Inicial de Caja:`} value={fmt(fondoInicial)} />
      <Row label={`⊕ (+) Ventas Cobradas en Efectivo ${moneda}:`} value={`+${fmt(ventas)}`} color="var(--success)" />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>⊖ (-) Vueltos / Cambios entregados en {moneda}:</span>
        <input type="number" step="0.01" value={vueltos} onChange={e => setVueltos(e.target.value)} style={{ width: 110, textAlign: 'right', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--danger)', fontWeight: 700 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>{esVES ? '▦ (-) Gastos de caja / Egresos autorizados:' : '↢ (-) Retiros parciales / Remesas:'}</span>
        <input type="number" step="0.01" value={esVES ? gastos : retiros} onChange={e => esVES ? setGastos(e.target.value) : setRetiros(e.target.value)} style={{ width: 110, textAlign: 'right', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border)', fontWeight: 700 }} />
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>MONTO ESPERADO TEÓRICO</div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{fmt(esperado)}</div>
      </div>
      <label style={{ fontSize: 11, fontWeight: 700 }}>Efectivo Físico Contado en Gaveta: <span style={{ color: 'var(--success)' }}>{conc ? '⊙ Coincidencia exacta' : ''}</span></label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, border: `2px solid ${conc ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 8, padding: '6px 10px' }}>
        <span style={{ fontWeight: 800 }}>{esVES ? 'Bs.' : '$'}</span>
        <input type="number" step="0.01" value={contado} onChange={e => setContado(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontWeight: 800, fontSize: 20, background: 'transparent' }} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{moneda}</span>
      </div>
    </div>
  );
}

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
    <span>{label}</span><strong style={color ? { color } : undefined}>{value}</strong>
  </div>
);

export function CierreTurnoModal({ preview, submitting, onCancel, onConfirm }) {
  const [lotesPM, setLotesPM] = useState('');
  const [verPM, setVerPM] = useState(preview?.desglose?.pagoMovil || '');
  const [lotesPt, setLotesPt] = useState('');
  const [verPt, setVerPt] = useState(preview?.desglose?.punto || '');
  const [lotesTr, setLotesTr] = useState('');
  const [verTr, setVerTr] = useState(preview?.desglose?.transferencia || '');

  const [vueltosUSD, setVueltosUSD] = useState('0');
  const [retirosUSD, setRetirosUSD] = useState('0');
  const [vueltosVES, setVueltosVES] = useState('0');
  const [gastosVES, setGastosVES] = useState('0');
  const [contadoUSD, setContadoUSD] = useState('');
  const [contadoVES, setContadoVES] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const tasa = Number(preview?.tasaCambio) || 0;
  const esperadoUSD = useMemo(() => {
    // Fondo inicial viene en USD (montoInicial). Ventas en efectivo USD + VES convertido a USD - vueltos - retiros
    const fondo = Number(preview?.caja?.montoInicial || 0);
    const ventasUSD = Number(preview?.desglose?.efectivo || 0);
    const ventasVES_USD = tasa > 0 ? Number(preview?.desgloseVES?.efectivo || 0) / tasa : 0;
    // El esperado en caja físico USD ya viene normalizado; usamos montoEsperadoCajaUSD y restamos vueltos/retiros
    return fondo + Number(preview?.desglose?.efectivo || 0) - (parseFloat(vueltosUSD) || 0) - (parseFloat(retirosUSD) || 0);
  }, [preview, vueltosUSD, retirosUSD, tasa]);

  const esperadoVES = useMemo(() => {
    // Fondo inicial VES no se captura: asumimos parte del fondo inicial en VES si la tasa aplica? No: fondo inicial en VES = 0 salvo que se registre.
    const ventasVES = Number(preview?.desgloseVES?.efectivo || 0);
    return ventasVES - (parseFloat(vueltosVES) || 0) - (parseFloat(gastosVES) || 0);
  }, [preview, vueltosVES, gastosVES]);

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 980, width: '95%' }}>
        <div className="modal-header">
          <h3 className="modal-title">Cerrar Turno — Cuadre de Caja {preview?.caja?.id ? `#${String(preview.caja.id).slice(0, 4)}` : ''}</h3>
          <span className="badge badge-warning">En Auditoría</span>
          <button className="modal-close" onClick={onCancel}><Icon icon={closeIcon} className="h-4 w-4" /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Cajero: <strong>{preview?.caja?.usuario?.nombre || '-'}</strong> · Caja: <strong>01</strong> · Apertura: <strong>{preview?.caja?.fechaApertura ? new Date(preview.caja.fechaApertura).toLocaleString() : '-'}</strong>
            <span style={{ float: 'right' }}>✓ {preview?.totalTransacciones || 0} transacciones completadas · {preview?.verificados?.totalConReferencia || 0} con referencia · Tasa Oficial BCV: <strong>{tasa ? `${tasa.toFixed(2)} VES/USD` : 'N/D'}</strong></span>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px' }}>Cobros Electrónicos y Bancarios Verificados <small style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Conciliación bancaria y lotes POS — verificación contra reportes y extractos bancarios</small></h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <VerificadoCard icon="mdi:cellphone-wireless" titulo="Pago Móvil P2P/C2P" subtitulo="Banesco Pay / Mercantil" registrado={preview?.desglose?.pagoMovil} lotesLabel="Lotes / Recibos" lotes={lotesPM} setLotes={setLotesPM} contravalor={preview?.desglose?.pagoMovil} verificado={verPM} setVerificado={setVerPM} diferencia={(parseFloat(verPM) || 0) - Number(preview?.desglose?.pagoMovil || 0)} />
              <VerificadoCard icon="mdi:credit-card" titulo="Punto de Venta (Tarjeta)" subtitulo="Terminal #8834" registrado={preview?.desglose?.punto} lotesLabel="Cierres de Lote POS" lotes={lotesPt} setLotes={setLotesPt} contravalor={preview?.desglose?.punto} verificado={verPt} setVerificado={setVerPt} diferencia={(parseFloat(verPt) || 0) - Number(preview?.desglose?.punto || 0)} />
              <VerificadoCard icon="mdi:bank" titulo="Transferencia Inmediata" subtitulo="Cuentas Custodia" registrado={preview?.desglose?.transferencia} lotesLabel="Comprobantes Bancarios" lotes={lotesTr} setLotes={setLotesTr} contravalor={preview?.desglose?.transferencia} verificado={verTr} setVerificado={setVerTr} diferencia={(parseFloat(verTr) || 0) - Number(preview?.desglose?.transferencia || 0)} />
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px' }}>Arqueo Físico en Gaveta por Moneda <small style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Regla contable: Arqueo estricto e independiente sin compensación cruzada</small></h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              <ArqueoCard moneda="USD" simbolo="$" color="#16a34a" fondoInicial={Number(preview?.caja?.montoInicial || 0)} ventas={Number(preview?.desglose?.efectivo || 0)} esVES={false} vueltos={vueltosUSD} setVueltos={setVueltosUSD} retiros={retirosUSD} setRetiros={setRetirosUSD} esperado={esperadoUSD} contado={contadoUSD} setContado={setContadoUSD} />
              <ArqueoCard moneda="VES" simbolo="Bs" color="#2563eb" fondoInicial={0} ventas={Number(preview?.desgloseVES?.efectivo || 0)} esVES={true} vueltos={vueltosVES} setVueltos={setVueltosVES} gastos={gastosVES} setGastos={setGastosVES} esperado={esperadoVES} contado={contadoVES} setContado={setContadoVES} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones / Descuadres</label>
            <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <small style={{ color: 'var(--danger)' }}>Acción irreversible. Al confirmar, la caja se bloqueará inmediatamente para nuevas facturaciones.</small>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar / Volver a Facturar</button>
          <button
            className="btn btn-primary"
            disabled={submitting}
            onClick={() => {
              const arqueoDetalle = {
                tasaCambio: tasa || null,
                cobros: {
                  pagoMovil: { lotes: Number(lotesPM) || 0, verificadoUSD: parseFloat(verPM) || 0 },
                  punto: { lotes: Number(lotesPt) || 0, verificadoUSD: parseFloat(verPt) || 0 },
                  transferencia: { comprobantes: Number(lotesTr) || 0, verificadoUSD: parseFloat(verTr) || 0 },
                },
                arqueo: {
                  usd: { fondoInicial: Number(preview?.caja?.montoInicial || 0), ventasEfectivo: Number(preview?.desglose?.efectivo || 0), vueltos: parseFloat(vueltosUSD) || 0, retiros: parseFloat(retirosUSD) || 0, esperado: esperadoUSD, contado: parseFloat(contadoUSD) || 0 },
                  ves: { ventasEfectivo: Number(preview?.desgloseVES?.efectivo || 0), vueltos: parseFloat(vueltosVES) || 0, gastos: parseFloat(gastosVES) || 0, esperado: esperadoVES, contado: parseFloat(contadoVES) || 0 },
                },
              };
              const montoFinalUSD = (parseFloat(contadoUSD) || 0) + (tasa > 0 ? (parseFloat(contadoVES) || 0) / tasa : 0);
              onConfirm(montoFinalUSD, observaciones, arqueoDetalle);
            }}
          >
            {submitting ? 'Cerrando...' : '🖨 Confirmar Cierre de Turno e Imprimir Acta'}
          </button>
        </div>
      </div>
    </div>
  );
}
