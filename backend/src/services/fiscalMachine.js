/**
 * FiscalMachine Service
 * Servicio singleton para comunicación con máquinas fiscales por puerto serial.
 * Protocolo primario: EPSON Fiscal (FP-81II, FP-90, TM-T900FA)
 * Extensible: Bixolon, Aclas
 */

let SerialPort, ReadlineParser;
try {
  const sp = require('serialport');
  SerialPort = sp.SerialPort;
  ReadlineParser = sp.parsers?.Readline || require('@serialport/parser-readline').ReadlineParser;
} catch (e) {
  console.warn('[Fiscal] serialport no disponible:', e.message);
}

const path = require('path');
const fs   = require('fs');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
const FISCAL_CONFIG_PATH = path.join(dataDir, 'fiscal.json');

// Comandos EPSON Fiscal (Venezuela / SENIAT)
const EPSON_CMDS = {
  INIT:          '\x1B\x40',         // Inicializar impresora
  STATUS:        '\x10\x04\x01',     // Estado de la impresora
  OPEN_FISCAL:   'S',                // Abrir documento fiscal de venta
  CLOSE_FISCAL:  'T',                // Cerrar / subtotalizar documento
  ADD_ITEM:      (desc, qty, price, taxId) =>
    `@${qty.toFixed(0)};${price.toFixed(2)};${taxId};${desc.substring(0, 20)}\n`,
  REPORT_X:      '\x1B\x76\x00',     // Reporte X (no cierra período)
  REPORT_Z:      '\x1B\x76\x01',     // Reporte Z (cierra período fiscal del día)
  CUT_PAPER:     '\x1D\x56\x42\x00', // Corte total de papel
};

class FiscalMachine {
  constructor() {
    this.port       = null;
    this.connected  = false;
    this.config     = this._loadConfig();
    this.lastStatus = null;
  }

  _loadConfig() {
    const defaults = {
      enabled:  false,
      port:     '/dev/ttyUSB0',
      baudRate: 9600,
      marca:    'EPSON',
    };
    try {
      if (fs.existsSync(FISCAL_CONFIG_PATH)) {
        return { ...defaults, ...JSON.parse(fs.readFileSync(FISCAL_CONFIG_PATH, 'utf8')) };
      }
    } catch { /* use defaults */ }
    return defaults;
  }

  saveConfig(cfg) {
    const dataDir = path.dirname(FISCAL_CONFIG_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    this.config = { ...this.config, ...cfg };
    fs.writeFileSync(FISCAL_CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf8');
  }

  getConfig() {
    return this.config;
  }

  getStatus() {
    return {
      connected:  this.connected,
      port:       this.config.port,
      baudRate:   this.config.baudRate,
      marca:      this.config.marca,
      enabled:    this.config.enabled,
      lastStatus: this.lastStatus,
    };
  }

  /**
   * Abre la conexión al puerto serial de la máquina fiscal.
   */
  async connect(portPath, baudRate, marca) {
    if (!SerialPort) throw new Error('El módulo serialport no está instalado en el servidor.');

    if (this.connected && this.port?.isOpen) {
      return { success: true, message: 'Ya conectado al puerto ' + portPath };
    }

    const cfg = {
      port:     portPath     || this.config.port,
      baudRate: baudRate     || this.config.baudRate,
      marca:    marca        || this.config.marca,
    };

    return new Promise((resolve, reject) => {
      const sp = new SerialPort({
        path:     cfg.port,
        baudRate: parseInt(cfg.baudRate) || 9600,
        dataBits: 8,
        parity:   'none',
        stopBits: 1,
        autoOpen: false,
      });

      sp.open((err) => {
        if (err) {
          this.connected = false;
          reject(new Error(`No se pudo abrir el puerto ${cfg.port}: ${err.message}`));
          return;
        }
        this.port      = sp;
        this.connected = true;
        this.saveConfig({ ...cfg, enabled: true });
        this.lastStatus = 'Conectado en ' + new Date().toISOString();
        resolve({ success: true, message: `Máquina fiscal conectada en ${cfg.port}` });
      });

      sp.on('error', (err) => {
        console.error('[Fiscal] Error serial:', err.message);
        this.connected = false;
        this.lastStatus = 'Error: ' + err.message;
      });

      sp.on('close', () => {
        this.connected = false;
        this.lastStatus = 'Desconectado';
      });
    });
  }

  async disconnect() {
    if (!this.port || !this.port.isOpen) {
      this.connected = false;
      return { success: true, message: 'No había conexión activa' };
    }
    return new Promise((resolve) => {
      this.port.close(() => {
        this.connected = false;
        this.port = null;
        this.saveConfig({ enabled: false });
        resolve({ success: true, message: 'Máquina fiscal desconectada' });
      });
    });
  }

  /**
   * Envía bytes al puerto serial.
   */
  _write(data) {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.port?.isOpen) {
        reject(new Error('Máquina fiscal no conectada'));
        return;
      }
      this.port.write(data, 'binary', (err) => {
        if (err) reject(new Error('Error al escribir en puerto serial: ' + err.message));
        else resolve();
      });
    });
  }

  /**
   * Imprime un documento fiscal de venta.
   * @param {Object} factura - Datos de la factura { cliente, items, subtotal, impuesto, total, tasaIva }
   */
  async imprimirVenta(factura) {
    if (!this.connected) throw new Error('Máquina fiscal no conectada. Configure el puerto en Ajustes → Máquina Fiscal.');

    const {
      cliente,
      items = [],
      subtotal = 0,
      impuesto = 0,
      total    = 0,
      tasaIva  = 16,
      numeroFactura,
    } = factura;

    const taxId = '1'; // ID de alícuota de IVA en la máquina

    // 1. Encabezado fiscal (datos del cliente)
    const rif = cliente?.rifCedula || '00000000';
    const nombre = (cliente?.razonSocial || 'CONSUMIDOR FINAL').substring(0, 30);

    let cmds = '';

    // Abrir documento fiscal
    cmds += `S${rif}\n${nombre}\n`;

    // Agregar líneas de detalle
    for (const item of items) {
      const desc  = (item.descripcionHistorica || item.nombre || 'Producto').substring(0, 20);
      const qty   = parseFloat(item.cantidad) || 1;
      const price = parseFloat(item.precioUnitarioHistorico || item.precioUnitario) || 0;
      cmds += `@${qty.toFixed(0)};${price.toFixed(2)};${taxId};${desc}\n`;
    }

    // Cerrar documento y subtotalizar
    cmds += 'T\n';

    // Cortar papel
    cmds += EPSON_CMDS.CUT_PAPER;

    await this._write(cmds);
    return { success: true, message: `Comprobante fiscal #${numeroFactura || ''} enviado a la máquina` };
  }

  /**
   * Genera el Reporte X (no cierra el período).
   */
  async reporteX() {
    if (!this.connected) throw new Error('Máquina fiscal no conectada');
    await this._write('I\n'); // Comando Reporte X EPSON
    return { success: true, message: 'Reporte X enviado a la máquina fiscal' };
  }

  /**
   * Genera el Reporte Z (cierra el período fiscal del día — ¡irreversible!).
   */
  async reporteZ() {
    if (!this.connected) throw new Error('Máquina fiscal no conectada');
    await this._write('Z\n'); // Comando Reporte Z EPSON
    return { success: true, message: 'Reporte Z enviado. Período fiscal del día cerrado.' };
  }
}

// Exportar singleton
let instance;
function getFiscalMachine() {
  if (!instance) instance = new FiscalMachine();
  return instance;
}

module.exports = { getFiscalMachine };
