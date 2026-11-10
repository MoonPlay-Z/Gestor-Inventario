import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Utils } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

// ── Formateadores ────────────────────────────────────────────────────────────
const fmtVES = (n) =>
  `Bs. ${Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUSD = (n) => `$ ${Number(n || 0).toFixed(2)}`;

// ── Mapa de métodos de pago no-efectivo (coincide con el catálogo del sistema)
// key == campo que llega en preview.desglose (pagoMovil | punto | transferencia)
const COBROS_CONFIG = [
  {
    key: 'pagoMovil',
    icon: 'mdi:cellphone-wireless',
    titulo: 'Pago Móvil P2P / C2P',
    subtitulo: 'Banesco Pay · Mercantil · BDV',
    lotesLabel: 'Lotes / Recibos recibidos',
    color: '#7c3aed',
  },
  {
    key: 'punto',
    icon: 'mdi:credit-card-outline',
    titulo: 'Punto de Venta (Tarjeta)',
    subtitulo: 'Débito · Crédito · BioPago BDV',
    lotesLabel: 'Cierres de Lote POS',
    color: '#0284c7',
  },
  {
    key: 'transferencia',
    icon: 'mdi:bank-transfer',
    titulo: 'Transferencias / Digital',
    subtitulo: 'Bancarias · Binance · Cashea · Zelle',
    lotesLabel: 'Comprobantes Bancarios',
    color: '#059669',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ cuadrado }) {
  return (
    <span style={{
      marginLeft: 'auto',
      fontSize: 11,
      padding: '2px 10px',
      borderRadius: 999,
      background: cuadrado ? 'rgba(22,163,74,0.12)' : 'rgba(234,179,8,0.14)',
      color: cuadrado ? 'var(--success, #16a34a)' : 'var(--warning, #ca8a04)',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {cuadrado ? '✓ Cuadrado' : '⚠ Pendiente'}
    </span>
  );
}

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2, gap: 8 }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <strong style={color ? { color } : { color: 'var(--text-primary)' }}>{value}</strong>
  </div>
);

// ── VerificadoCard ───────────────────────────────────────────────────────────
// registradoVES: monto en Bs. recibido (desgloseVES[key]) — es la moneda principal
// registradoUSD: equivalente USD del sistema (desglose[key]) — referencia secundaria
// tasa: tasa de cambio BCV para convertir Bs. verificados → USD al confirmar
function VerificadoCard({ icon, titulo, subtitulo, registradoVES, registradoUSD, lotesLabel, lotes, setLotes, verificado, setVerificado, color }) {
  const regVES = Number(registradoVES || 0);
  const regUSD = Number(registradoUSD || 0);
  const ver = parseFloat(verificado) || 0;
  // Diferencia en Bs. — tolerancia 1 Bs. para evitar rechazos por redondeo de tasa
  const diferencia = ver - regVES;
  const cuadrado = Math.abs(diferencia) < 1;

  return (
    <div style={{
      border: `1px solid ${cuadrado ? 'rgba(22,163,74,0.35)' : 'var(--border)'}`,
      borderRadius: 12,
      padding: '14px 16px',
      background: 'var(--bg-primary, #fff)',
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: cuadrado ? '0 0 0 2px rgba(22,163,74,0.1)' : 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Header — minWidth:0 en el contenedor de texto evita desborde en flex */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: `${color}1a`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon icon={icon} style={{ fontSize: '1.1rem', color }} />
        </div>
        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontWeight: 700, fontSize: 13, color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{titulo}</div>
          <div style={{
            fontSize: 11, color: 'var(--text-secondary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{subtitulo}</div>
        </div>
        <StatusBadge cuadrado={cuadrado} />
      </div>

      {/* Datos del sistema — Bs. principal, USD referencia */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Row label="Registrado en Sistema:" value={fmtVES(regVES)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{lotesLabel}:</span>
          <input
            type="number" min="0" value={lotes}
            onChange={e => setLotes(e.target.value)}
            placeholder="0"
            style={{
              width: 72, textAlign: 'right', padding: '3px 7px',
              borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg-primary)', color,
              fontWeight: 700, fontSize: 13,
            }}
          />
        </div>
        {/* Contravalor en USD como referencia secundaria */}
        <Row label="Contravalor BCV:" value={fmtUSD(regUSD)} />
      </div>

      {/* Campo verificación en Bs. */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          Monto Verificado en Banco:
          {cuadrado && <span style={{ color: 'var(--success)' }}>⊙ Conciliado</span>}
        </label>
        <div style={{
          marginTop: 4,
          display: 'flex', alignItems: 'center',
          border: `2px solid ${cuadrado ? 'var(--success, #16a34a)' : 'var(--border)'}`,
          borderRadius: 8, padding: '6px 10px',
          background: cuadrado ? 'rgba(22,163,74,0.04)' : 'var(--bg-secondary)',
          transition: 'border-color 0.2s',
          overflow: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)', marginRight: 6, flexShrink: 0 }}>Bs.</span>
          <input
            type="number" step="0.01" value={verificado}
            onChange={e => setVerificado(e.target.value)}
            placeholder={regVES.toFixed(2)}
            style={{
              flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none',
              fontWeight: 800, fontSize: 18,
              background: 'transparent', color: 'var(--text-primary)',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>VES</span>
        </div>
      </div>

      {/* Diferencia en Bs. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Diferencia:</span>
        <strong style={{ color: cuadrado ? 'var(--success)' : 'var(--danger)' }}>
          {cuadrado ? `${fmtVES(0)} (Exacto)` : `${diferencia >= 0 ? '+' : ''}${fmtVES(diferencia)}`}
        </strong>
      </div>
    </div>
  );
}

// ── ArqueoCard ───────────────────────────────────────────────────────────────
function ArqueoCard({ esVES, fondoInicial, ventas, vueltos, setVueltos, retiros, setRetiros, gastos, setGastos, esperado, contado, setContado }) {
  const contadoNum = parseFloat(contado) || 0;
  const cuadrado = Math.abs(contadoNum - esperado) < 0.01;
  const fmt = esVES ? fmtVES : fmtUSD;
  const color = esVES ? '#2563eb' : '#16a34a';
  const simbolo = esVES ? 'Bs' : '$';

  return (
    <div style={{
      border: `1px solid ${cuadrado ? 'rgba(22,163,74,0.35)' : 'var(--border)'}`,
      borderRadius: 12, padding: '16px 18px',
      background: 'var(--bg-primary, #fff)',
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: cuadrado ? '0 0 0 2px rgba(22,163,74,0.1)' : 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 999, background: color,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0,
        }}>{simbolo}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            Efectivo {esVES ? 'Bolívares (VES)' : 'Dólares (USD)'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Custodia física de {esVES ? 'papel moneda local' : 'billetes USD'}
          </div>
        </div>
        <StatusBadge cuadrado={cuadrado} />
      </div>

      {/* Desglose */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Row label="▷ Fondo Inicial de Caja:" value={fmt(fondoInicial)} />
        <Row label={`⊕ (+) Ventas Cobradas en Efectivo ${esVES ? 'VES' : 'USD'}:`} value={`+${fmt(ventas)}`} color="var(--success)" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>⊖ (-) Vueltos / Cambios en {esVES ? 'VES' : 'USD'}:</span>
          <input
            type="number" step="0.01" min="0" value={vueltos}
            onChange={e => setVueltos(e.target.value)}
            style={{
              width: 100, textAlign: 'right', padding: '3px 7px',
              borderRadius: 6, border: '1px solid var(--border)',
              color: 'var(--danger)', fontWeight: 700, fontSize: 13,
              background: 'var(--bg-primary)',
            }}
          />
        </div>

        {esVES ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>▦ (-) Gastos / Egresos autorizados:</span>
            <input
              type="number" step="0.01" min="0" value={gastos}
              onChange={e => setGastos(e.target.value)}
              style={{
                width: 100, textAlign: 'right', padding: '3px 7px',
                borderRadius: 6, border: '1px solid var(--border)',
                fontWeight: 700, fontSize: 13, background: 'var(--bg-primary)',
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>↢ (-) Retiros parciales / Remesas:</span>
            <input
              type="number" step="0.01" min="0" value={retiros}
              onChange={e => setRetiros(e.target.value)}
              style={{
                width: 100, textAlign: 'right', padding: '3px 7px',
                borderRadius: 6, border: '1px solid var(--border)',
                fontWeight: 700, fontSize: 13, background: 'var(--bg-primary)',
              }}
            />
          </div>
        )}
      </div>

      {/* Esperado teórico */}
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>
          Monto Esperado Teórico
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{fmt(esperado)}</div>
      </div>

      {/* Campo conteo físico */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          Efectivo Físico Contado en Gaveta:
          {cuadrado && <span style={{ color: 'var(--success)' }}>⊙ Coincidencia exacta</span>}
        </label>
        <div style={{
          marginTop: 4,
          display: 'flex', alignItems: 'center',
          border: `2px solid ${contado === '' || contado === undefined ? 'var(--border)' : cuadrado ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)'}`,
          borderRadius: 10, padding: '8px 12px',
          background: (contado === '' || contado === undefined) ? 'transparent' : cuadrado ? 'rgba(22,163,74,0.04)' : 'rgba(220,38,38,0.03)',
          transition: 'border-color 0.2s',
          overflow: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-secondary)', marginRight: 8, flexShrink: 0 }}>
            {esVES ? 'Bs.' : '$'}
          </span>
          <input
            type="number" step="0.01" value={contado}
            onChange={e => setContado(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none',
              fontWeight: 800, fontSize: 22,
              background: 'transparent', color: 'var(--text-primary)',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{esVES ? 'VES' : 'USD'}</span>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function CierreTurnoModal({ preview, submitting, onCancel, onConfirm }) {
  const { empresa } = useAuth();

  // Estado para cada cobro electrónico (lotes + monto verificado en Bs.)
  // Se inicializa con desgloseVES porque Pago Móvil / Punto / Transferencia se cobran en VES
  const [cobros, setCobros] = useState(() =>
    Object.fromEntries(
      COBROS_CONFIG.map(({ key }) => [key, {
        lotes: '',
        verificado: String(Number(preview?.desgloseVES?.[key] || 0)),
      }])
    )
  );
  const setCobro = (key, field, val) =>
    setCobros(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));

  // Estado del arqueo de efectivo
  const [vueltosUSD, setVueltosUSD] = useState('0');
  const [retirosUSD, setRetirosUSD] = useState('0');
  const [vueltosVES, setVueltosVES] = useState('0');
  const [gastosVES, setGastosVES] = useState('0');
  const [contadoUSD, setContadoUSD] = useState('');
  const [contadoVES, setContadoVES] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Tasa BCV del preview (ya corregida por el backend)
  const tasa = Number(preview?.tasaCambio || empresa?.tasaDolar || 0);
  const fondoInicialVES = Number(preview?.fondoInicialVES ?? preview?.caja?.montoInicialVES ?? 0);

  const esperadoUSD = useMemo(() => {
    const fondo = Number(preview?.caja?.montoInicial || 0);
    const ventasUSD = Number(preview?.efectivoRecibido?.USD || 0);
    return fondo + ventasUSD - (parseFloat(vueltosUSD) || 0) - (parseFloat(retirosUSD) || 0);
  }, [preview, vueltosUSD, retirosUSD]);

  const esperadoVES = useMemo(() => {
    const ventasVES = Number(preview?.desgloseVES?.efectivo || 0);
    return fondoInicialVES + ventasVES - (parseFloat(vueltosVES) || 0) - (parseFloat(gastosVES) || 0);
  }, [preview, fondoInicialVES, vueltosVES, gastosVES]);

  const handleConfirm = () => {
    const arqueoDetalle = {
      tasaCambio: tasa || null,
      cobros: Object.fromEntries(
        COBROS_CONFIG.map(({ key }) => {
          // El cajero ingresa el monto verificado en Bs.; se guarda también en USD dividiendo por la tasa
          const verificadoBs = parseFloat(cobros[key]?.verificado) || 0;
          return [key, {
            lotes: Number(cobros[key]?.lotes) || 0,
            verificadoBs,
            verificadoUSD: tasa > 0 ? verificadoBs / tasa : 0,
          }];
        })
      ),
      arqueo: {
        usd: {
          fondoInicial: Number(preview?.caja?.montoInicial || 0),
          ventasEfectivo: Number(preview?.efectivoRecibido?.USD || 0),
          vueltos: parseFloat(vueltosUSD) || 0,
          retiros: parseFloat(retirosUSD) || 0,
          esperado: esperadoUSD,
          contado: parseFloat(contadoUSD) || 0,
        },
        ves: {
          fondoInicial: fondoInicialVES,
          ventasEfectivo: Number(preview?.desgloseVES?.efectivo || 0),
          vueltos: parseFloat(vueltosVES) || 0,
          gastos: parseFloat(gastosVES) || 0,
          esperado: esperadoVES,
          contado: parseFloat(contadoVES) || 0,
        },
      },
    };
    // Si el cajero no contó nada (ambos campos vacíos), enviamos null para que
    // el backend use el monto esperado teórico (fondoInicial + ingresosEfectivo).
    // Si llenó al menos uno, calculamos la suma normalizada a USD.
    const hayConteoUSD = contadoUSD !== '' && contadoUSD !== undefined && contadoUSD !== null;
    const hayConteoVES = contadoVES !== '' && contadoVES !== undefined && contadoVES !== null;
    const montoFinalUSD = (hayConteoUSD || hayConteoVES)
      ? (parseFloat(contadoUSD) || 0) + (tasa > 0 ? (parseFloat(contadoVES) || 0) / tasa : 0)
      : null; // null → backend recalcula desde ingresosEfectivo
    onConfirm(montoFinalUSD, observaciones, arqueoDetalle);
  };

  const idCaja = preview?.caja?.id ? `#${String(preview.caja.id).slice(0, 4)}` : '';

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: 1020, width: '96%' }}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ flexWrap: 'wrap', gap: 8 }}>
          <h3 className="modal-title" style={{ fontSize: '1rem' }}>
            Cerrar Turno — Cuadre de Caja {idCaja}
          </h3>
          <span className="badge badge-warning" style={{ marginLeft: 4 }}>En Auditoría</span>
          <button className="modal-close" onClick={onCancel} style={{ marginLeft: 'auto' }}>
            <Icon icon="mdi:close" className="h-4 w-4" />
          </button>
        </div>

        {/* ── Info del turno ── */}
        <div style={{
          padding: '8px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-secondary)',
          display: 'flex', flexWrap: 'wrap', gap: '4px 20px', alignItems: 'center',
        }}>
          <span>
            Cajero: <strong style={{ color: 'var(--text-primary)' }}>
              {preview?.caja?.usuario?.nombre || preview?.caja?.usuario?.username || '-'}
            </strong>
          </span>
          <span>· Caja: <strong>01</strong></span>
          <span>· Apertura: <strong style={{ color: 'var(--text-primary)' }}>
            {preview?.caja?.fechaApertura ? new Date(preview.caja.fechaApertura).toLocaleString('es-VE') : '-'}
          </strong></span>
          <span style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
            <span>✓ <strong>{preview?.totalTransacciones || 0}</strong> transacciones</span>
            <span>· <strong>{preview?.verificados?.totalConReferencia || 0}</strong> con referencia</span>
            <span>· Tasa BCV: <strong style={{ color: 'var(--accent)' }}>
              {tasa ? `${tasa.toFixed(2)} Bs./USD` : 'N/D'}
            </strong></span>
          </span>
        </div>

        {/* ── Body ── */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Cobros electrónicos */}
          <section>
            <div style={{ marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
                Cobros Electrónicos y Bancarios Verificados
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>
                Conciliación bancaria y lotes POS — verificación contra reportes y extractos bancarios
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
              {COBROS_CONFIG.map(({ key, icon, titulo, subtitulo, lotesLabel, color }) => (
                <VerificadoCard
                  key={key}
                  icon={icon}
                  titulo={titulo}
                  subtitulo={subtitulo}
                  registradoVES={preview?.desgloseVES?.[key] || 0}
                  registradoUSD={preview?.desglose?.[key] || 0}
                  lotesLabel={lotesLabel}
                  color={color}
                  lotes={cobros[key]?.lotes}
                  setLotes={(v) => setCobro(key, 'lotes', v)}
                  verificado={cobros[key]?.verificado}
                  setVerificado={(v) => setCobro(key, 'verificado', v)}
                />
              ))}
            </div>
          </section>

          {/* Arqueo de efectivo */}
          <section>
            <div style={{ marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
                Arqueo Físico en Gaveta por Moneda
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>
                Regla contable: Arqueo estricto e independiente sin compensación cruzada
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: 12 }}>
              <ArqueoCard
                esVES={false}
                fondoInicial={Number(preview?.caja?.montoInicial || 0)}
                ventas={Number(preview?.efectivoRecibido?.USD || 0)}
                vueltos={vueltosUSD} setVueltos={setVueltosUSD}
                retiros={retirosUSD} setRetiros={setRetirosUSD}
                gastos="0" setGastos={() => {}}
                esperado={esperadoUSD}
                contado={contadoUSD} setContado={setContadoUSD}
              />
              <ArqueoCard
                esVES={true}
                fondoInicial={fondoInicialVES}
                ventas={Number(preview?.desgloseVES?.efectivo || 0)}
                vueltos={vueltosVES} setVueltos={setVueltosVES}
                retiros="0" setRetiros={() => {}}
                gastos={gastosVES} setGastos={setGastosVES}
                esperado={esperadoVES}
                contado={contadoVES} setContado={setContadoVES}
              />
            </div>
          </section>

          {/* Observaciones */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Observaciones / Descuadres</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Notas sobre diferencias, incidencias del turno..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <small style={{ color: 'var(--danger)', flex: '1 1 auto', minWidth: 160 }}>
            ⚠ Acción irreversible. Al confirmar, la caja se bloqueará inmediatamente para nuevas facturaciones.
          </small>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar / Volver a Facturar
          </Button>
          <Button
            variant="primary"
            icon="mdi:printer"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? 'Cerrando...' : 'Confirmar Cierre de Turno e Imprimir Acta'}
          </Button>
        </div>
      </div>
    </div>
  );
}
