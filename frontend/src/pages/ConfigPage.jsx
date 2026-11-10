import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { CustomSelect } from '../components/ui';

const OPCIONES_EXHIBICION = [
  { value: 'USD', label: 'USD (Dólar)', icon: 'mdi:currency-usd' },
  { value: 'VES', label: 'VES (Bolívar)', icon: 'mdi:cash' },
];

const OPCIONES_SIMBOLO = [
  { value: '$', label: '$ (Dólar)', icon: 'mdi:currency-usd' },
  { value: 'Bs.', label: 'Bs. (Bolívar)', icon: 'mdi:cash' },
  { value: '€', label: '€ (Euro)', icon: 'mdi:currency-eur' },
  { value: 'COP$', label: 'COP$ (Peso colombiano)', icon: 'mdi:cash-multiple' },
];

const OPCIONES_CODIGO = [
  { value: 'USD', label: 'USD — Dólar estadounidense', icon: 'mdi:currency-usd' },
  { value: 'VES', label: 'VES — Bolívar venezolano', icon: 'mdi:cash' },
  { value: 'EUR', label: 'EUR — Euro', icon: 'mdi:currency-eur' },
  { value: 'COP', label: 'COP — Peso colombiano', icon: 'mdi:cash-multiple' },
];

const MAPA_CODIGO_A_SIMBOLO = {
  USD: '$',
  VES: 'Bs.',
  EUR: '€',
  COP: 'COP$',
};

const MAPA_SIMBOLO_A_CODIGO = {
  '$': 'USD',
  'Bs.': 'VES',
  'Bs': 'VES',
  '€': 'EUR',
  'COP$': 'COP',
};

const OPCIONES_TIPO_DOC = [
  { value: 'FACTURA', label: 'Factura Fiscal', icon: 'mdi:file-document-outline' },
  { value: 'NOTA_ENTREGA', label: 'Nota de Entrega', icon: 'mdi:receipt-text-outline' },
];

const OPCIONES_BAUD_RATE = [
  { value: '9600', label: '9600 bps' },
  { value: '19200', label: '19200 bps' },
  { value: '4800', label: '4800 bps' },
  { value: '2400', label: '2400 bps' },
];

const OPCIONES_MARCA_FISCAL = [
  { value: 'EPSON', label: 'EPSON (TM-T900FA / FP-81II / FP-90)', icon: 'mdi:printer' },
  { value: 'BIXOLON', label: 'Bixolon (SRP-F310II)', icon: 'mdi:printer' },
  { value: 'ACLAS', label: 'Aclas (CG5-BF)', icon: 'mdi:printer' },
];

export function ConfigPage() {
  const { toggleSidebar, setBrandName } = useOutletContext();
  const { showToast } = useToast();
  const { user, empresa, updateEmpresa } = useAuth();
  
  const [loading, setLoading] = useState(true);
  
  // States for System Config
  const [savingConfig, setSavingConfig] = useState(false);
  const [config, setConfig] = useState({
    empresa: {
      nombre: user?.nombre || '',
      rif: '',
      direccion: '',
      telefono: '',
      email: user?.username && user.username.includes('@') ? user.username : ''
    },
    moneda: {
      simbolo: '$',
      codigo: 'USD',
      tasaDolar: empresa?.tasaDolar ?? 1.0,
      monedaBase: 'USD',
      monedaExhibicion: empresa?.monedaExhibicion === 'VES' ? 'VES' : 'USD',
    },
    ivaDefault: 16.0,
    tipoDocumento: 'FACTURA'
  });

  // States for Profile
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [perfil, setPerfil] = useState({
    nombre: user?.nombre || '',
    password: '',
    passwordConfirm: ''
  });

  // States for Backup
  const [backupLoading, setBackupLoading] = useState(false);
  const fileInputRef = useRef(null);

  // States for Fiscal Machine
  const [fiscal, setFiscal] = useState({
    enabled: false,
    port: '/dev/ttyUSB0',
    baudRate: 9600,
    marca: 'EPSON',
    connected: false,
    lastStatus: null,
  });
  const [fiscalLoading, setFiscalLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await API.getConfig();
        setConfig(prev => ({
          empresa: {
            nombre: data.empresa?.nombre || prev.empresa.nombre || '',
            rif: data.empresa?.rif || prev.empresa.rif || '',
            direccion: data.empresa?.direccion || prev.empresa.direccion || '',
            telefono: data.empresa?.telefono || prev.empresa.telefono || '',
            email: data.empresa?.email || prev.empresa.email || ''
          },
          moneda: {
            simbolo: data.moneda?.simbolo || '$',
            codigo: data.moneda?.codigo || 'USD',
            tasaDolar: data.moneda?.tasaDolar ?? 1.0,
            monedaBase: 'USD',
            monedaExhibicion: data.moneda?.monedaExhibicion === 'VES' ? 'VES' : 'USD',
          },
          ivaDefault: data.ivaDefault ?? 16.0,
          tipoDocumento: data.tipoDocumento || 'FACTURA'
        }));
      } catch (err) {
        showToast(err.message || 'No se pudo cargar la configuración', 'error');
      } finally {
        setLoading(false);
      }
    };

    const loadFiscal = async () => {
      try {
        const data = await API.getFiscalStatus();
        setFiscal(prev => ({ ...prev, ...data }));
      } catch (e) {
        // Fiscal service silent default
      }
    };

    loadConfig();
    loadFiscal();
  }, [showToast]);

  const handleChangeConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSimboloChange = (simboloVal) => {
    const codigoSugerido = MAPA_SIMBOLO_A_CODIGO[simboloVal] || config.moneda.codigo;
    setConfig(prev => ({
      ...prev,
      moneda: {
        ...prev.moneda,
        simbolo: simboloVal,
        codigo: codigoSugerido,
      }
    }));
  };

  const handleCodigoChange = (codigoVal) => {
    const simboloSugerido = MAPA_CODIGO_A_SIMBOLO[codigoVal] || config.moneda.simbolo;
    setConfig(prev => ({
      ...prev,
      moneda: {
        ...prev.moneda,
        codigo: codigoVal,
        simbolo: simboloSugerido,
      }
    }));
  };

  const opcionesSimbolo = React.useMemo(() => {
    const actual = config.moneda.simbolo;
    if (actual && !OPCIONES_SIMBOLO.some(o => o.value === actual)) {
      return [{ value: actual, label: actual, icon: 'mdi:currency-usd' }, ...OPCIONES_SIMBOLO];
    }
    return OPCIONES_SIMBOLO;
  }, [config.moneda.simbolo]);

  const opcionesCodigo = React.useMemo(() => {
    const actual = config.moneda.codigo;
    if (actual && !OPCIONES_CODIGO.some(o => o.value === actual)) {
      return [{ value: actual, label: actual, icon: 'mdi:currency-usd' }, ...OPCIONES_CODIGO];
    }
    return OPCIONES_CODIGO;
  }, [config.moneda.codigo]);

  const handleSubmitConfig = async (event) => {
    event.preventDefault();
    setSavingConfig(true);
    try {
      const saved = await API.saveConfig(config);
      setBrandName(config.empresa.nombre || 'Sistema POS');
      if (saved?.moneda) {
        updateEmpresa({
          ...(empresa || {}),
          ...(saved.empresa || {}),
          monedaBase: saved.moneda.monedaBase || 'USD',
          monedaExhibicion: saved.moneda.monedaExhibicion || 'USD',
          tasaDolar: saved.moneda.tasaDolar,
          monedaSimbolo: saved.moneda.simbolo,
          monedaCodigo: saved.moneda.codigo,
        });
      }
      showToast('Configuración guardada correctamente', 'success');
    } catch (err) {
      showToast(err.message || 'Error guardando la configuración', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSubmitPerfil = async (event) => {
    event.preventDefault();
    if (perfil.password && perfil.password !== perfil.passwordConfirm) {
      return showToast('Las contraseñas no coinciden', 'error');
    }
    
    setSavingPerfil(true);
    try {
      const data = { nombre: perfil.nombre };
      if (perfil.password) {
        data.password = perfil.password;
      }
      
      await API.actualizarUsuario(user.id, data);
      showToast('Perfil actualizado correctamente. Es posible que debas iniciar sesión nuevamente si cambiaste la contraseña.', 'success');
      setPerfil(prev => ({ ...prev, password: '', passwordConfirm: '' }));
      
      // Update local storage user name visually
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser) {
        storedUser.nombre = perfil.nombre;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('auth:updated')); // Note: Assuming context listens to this, or just reload
      }
    } catch (err) {
      showToast(err.message || 'Error al actualizar perfil', 'error');
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleExportBackup = async () => {
    setBackupLoading(true);
    try {
      await API.exportarRespaldo();
      showToast('Respaldo exportado correctamente', 'success');
    } catch (err) {
      showToast(err.message || 'Error al exportar respaldo', 'error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.confirm('¿ATENCIÓN: Restaurar un respaldo reemplazará los datos actuales por los del archivo. ¿Deseas continuar?')) {
      event.target.value = '';
      return;
    }
    setBackupLoading(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      await API.importarRespaldo(jsonData);
      showToast('¡Base de datos restaurada con éxito! La página se recargará.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showToast('Error al restaurar respaldo: ' + err.message, 'error');
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  };

  const handleConnectFiscal = async () => {
    setFiscalLoading(true);
    try {
      const result = await API.connectFiscal({
        port: fiscal.port,
        baudRate: Number(fiscal.baudRate),
        marca: fiscal.marca
      });
      setFiscal(prev => ({ ...prev, connected: true, lastStatus: result.message }));
      showToast('Máquina Fiscal conectada exitosamente', 'success');
    } catch (err) {
      showToast(err.message || 'Error al conectar máquina fiscal', 'error');
    } finally {
      setFiscalLoading(false);
    }
  };

  const handleDisconnectFiscal = async () => {
    setFiscalLoading(true);
    try {
      await API.disconnectFiscal();
      setFiscal(prev => ({ ...prev, connected: false }));
      showToast('Máquina Fiscal desconectada', 'success');
    } catch (err) {
      showToast(err.message || 'Error al desconectar', 'error');
    } finally {
      setFiscalLoading(false);
    }
  };

  const handleReporteX = async () => {
    try {
      await API.reporteXFiscal();
      showToast('Reporte X enviado a la impresora', 'success');
    } catch (err) {
      showToast(err.message || 'Error al emitir Reporte X', 'error');
    }
  };

  const handleReporteZ = async () => {
    if (!window.confirm('¿Estás seguro de emitir el Reporte Z? Esto cerrará el día fiscal de la impresora y no se puede deshacer.')) {
      return;
    }
    try {
      await API.reporteZFiscal();
      showToast('Reporte Z enviado a la impresora (Cierre Diario)', 'success');
    } catch (err) {
      showToast(err.message || 'Error al emitir Reporte Z', 'error');
    }
  };

  return (
    <>
      <Header
        title="Configuración"
        subtitle="Ajusta los datos de tu empresa, perfil y respaldos"
        toggleSidebar={toggleSidebar}
      />
      <div className="page-body">
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
              <p style={{ marginTop: '14px', color: 'var(--text-secondary)' }}>Cargando configuración...</p>
            </div>
          ) : (
            <>
              {/* --- PERFIL DE USUARIO --- */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <h2 className="card-title">Perfil de Usuario</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Actualiza tu nombre de usuario y cambia tu contraseña.
                  </p>
                </div>
                <form onSubmit={handleSubmitPerfil}>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombre / Razón Social</label>
                      <input
                        type="text"
                        className="form-control"
                        value={perfil.nombre}
                        onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Usuario (Email)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.username || ''}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nueva Contraseña (Opcional)</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Dejar en blanco para no cambiar"
                        value={perfil.password}
                        onChange={e => setPerfil({ ...perfil, password: e.target.value })}
                        minLength={8}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirmar Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirmar nueva contraseña"
                        value={perfil.passwordConfirm}
                        onChange={e => setPerfil({ ...perfil, passwordConfirm: e.target.value })}
                        minLength={8}
                        required={!!perfil.password}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary" disabled={savingPerfil}>
                      {savingPerfil ? 'Guardando...' : 'Actualizar Perfil'}
                    </button>
                  </div>
                </form>
              </div>

              {/* --- CONFIGURACION SISTEMA --- */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <h2 className="card-title">Configuración del Sistema</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Actualiza los datos de facturación de tu empresa y la moneda predeterminada.
                  </p>
                </div>
                <form onSubmit={handleSubmitConfig} style={{ display: 'grid', gap: '24px' }}>
                  <section>
                    <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Datos de la Empresa</h3>
                    <div className="form-grid form-grid-2" style={{ marginTop: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Nombre Comercial</label>
                        <input
                          type="text"
                          className="form-control"
                          value={config.empresa.nombre}
                          onChange={e => handleChangeConfig('empresa', 'nombre', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Identificación Fiscal (RIF/NIT/RUT)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={config.empresa.rif}
                          onChange={e => handleChangeConfig('empresa', 'rif', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dirección</label>
                        <input
                          type="text"
                          className="form-control"
                          value={config.empresa.direccion}
                          onChange={e => handleChangeConfig('empresa', 'direccion', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={config.empresa.telefono}
                          onChange={e => handleChangeConfig('empresa', 'telefono', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Correo Electrónico (Contacto)</label>
                        <input
                          type="email"
                          className="form-control"
                          value={config.empresa.email}
                          onChange={e => handleChangeConfig('empresa', 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Moneda y Documentos</h3>
                    <div className="form-grid form-grid-2" style={{ marginTop: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Símbolo</label>
                        <CustomSelect
                          value={config.moneda.simbolo}
                          onChange={handleSimboloChange}
                          options={opcionesSimbolo}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Código</label>
                        <CustomSelect
                          value={config.moneda.codigo}
                          onChange={handleCodigoChange}
                          options={opcionesCodigo}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tasa de Cambio (Divisa)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={config.moneda.tasaDolar}
                          onChange={e => handleChangeConfig('moneda', 'tasaDolar', e.target.value)}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Moneda Base (inventario / precios)</label>
                        <input className="form-control" value="USD (Dólar)" readOnly />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Moneda de Exhibición (ventas / reportes)</label>
                        <CustomSelect
                          value={config.moneda.monedaExhibicion || 'USD'}
                          onChange={val => handleChangeConfig('moneda', 'monedaExhibicion', val)}
                          options={OPCIONES_EXHIBICION}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tipo de Documento</label>
                        <CustomSelect
                          value={config.tipoDocumento}
                          onChange={val => setConfig(prev => ({ ...prev, tipoDocumento: val }))}
                          options={OPCIONES_TIPO_DOC}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Impuesto Predeterminado (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={config.ivaDefault}
                          onChange={e => setConfig(prev => ({ ...prev, ivaDefault: e.target.value }))}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </section>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={savingConfig}>
                      {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>
                </form>
              </div>

              {/* --- RESPALDO Y RESTAURACIÓN --- */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <h2 className="card-title">Respaldo y Restauración</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Exporta todos tus datos (clientes, productos, facturas) en un archivo JSON o restaura un respaldo existente.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleExportBackup}
                    disabled={backupLoading}
                  >
                    Exportar Base de Datos
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".json"
                    onChange={handleImportBackup}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={backupLoading}
                  >
                    Restaurar Respaldo
                  </button>
                </div>
                {backupLoading && (
                  <p style={{ color: 'var(--primary)', marginTop: '12px', fontSize: '0.9rem' }}>
                    Procesando operación, por favor espera...
                  </p>
                )}
              </div>

              {/* --- MÁQUINA FISCAL --- */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <h2 className="card-title">Máquina Fiscal / Impresora Serial</h2>
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Conexión por puerto serial (USB/COM) para impresión de comprobantes fiscales y reportes SENIAT / LATAM.
                      </p>
                    </div>
                    <span className={`badge ${fiscal.connected ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                      {fiscal.connected ? '● CONECTADA' : '○ DESCONECTADA'}
                    </span>
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Puerto Serial (USB / COM)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fiscal.port}
                      onChange={e => setFiscal(prev => ({ ...prev, port: e.target.value }))}
                      placeholder="/dev/ttyUSB0 o COM3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Velocidad (Baud Rate)</label>
                    <CustomSelect
                      value={fiscal.baudRate}
                      onChange={val => setFiscal(prev => ({ ...prev, baudRate: val }))}
                      options={OPCIONES_BAUD_RATE}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marca / Protocolo</label>
                    <CustomSelect
                      value={fiscal.marca}
                      onChange={val => setFiscal(prev => ({ ...prev, marca: val }))}
                      options={OPCIONES_MARCA_FISCAL}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  {!fiscal.connected ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConnectFiscal}
                      disabled={fiscalLoading}
                    >
                      {fiscalLoading ? 'Conectando...' : 'Conectar Máquina Fiscal'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleDisconnectFiscal}
                      disabled={fiscalLoading}
                    >
                      Desconectar
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReporteX}
                    disabled={!fiscal.connected}
                    title="Imprime un reporte X de prueba sin cerrar el período fiscal"
                  >
                    Reporte X (Parcial)
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleReporteZ}
                    disabled={!fiscal.connected}
                    style={{ background: 'var(--danger)', color: '#fff' }}
                    title="Imprime el reporte Z y CIERRA el día fiscal"
                  >
                    Reporte Z (Cierre Diario)
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
