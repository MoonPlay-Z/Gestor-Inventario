package com.gestorpos.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import java.io.File;
import java.util.Locale;

/**
 * Descarga, verifica e instala una actualización de la APK.
 *
 * Es el único sitio que conoce el estado de la actualización. La verificación
 * del archivo vive en {@link VerificadorApk}; esta clase decide qué hacer con
 * el resultado (borrar el APK inválido, publicar el error, etc.).
 *
 * El progreso se consulta con {@link #estadoJson()} porque DownloadManager
 * notifica los cambios de forma asíncrona y el WebView pregunta cada 700 ms.
 */
public final class ActualizadorApk {

    private static final String ESTADO_INACTIVO = "inactivo";
    private static final String ESTADO_DESCARGANDO = "descargando";
    private static final String ESTADO_VERIFICANDO = "verificando";
    private static final String ESTADO_LISTO = "listo";
    private static final String ESTADO_PERMISO = "permiso";
    private static final String ESTADO_ERROR = "error";

    private final Context contexto;
    private final VerificadorApk verificador;

    private volatile long idDescarga = -1;
    private volatile File archivoDescarga;
    private volatile String shaEsperada = "";
    private volatile int versionEsperada = 0;
    private volatile String estado = ESTADO_INACTIVO;
    private volatile String mensaje = "";
    private volatile int progreso = 0;
    private volatile boolean verificando = false;

    private BroadcastReceiver receptorDescarga;
    private DownloadManager gestorDescargas;

    public ActualizadorApk(Context contexto) {
        this.contexto = contexto.getApplicationContext();
        this.verificador = new VerificadorApk(this.contexto);
    }

    // ─── API que consume el puente JavaScript ──────────────────────────────

    /** Versión instalada, para comparar antes de avisar. */
    public String versionInstaladaJson() {
        try {
            PackageInfo info = contexto.getPackageManager()
                    .getPackageInfo(contexto.getPackageName(), 0);
            return "{\"versionCode\":" + VerificadorApk.codigoVersion(info)
                    + ",\"versionName\":\"" + escapar(info.versionName) + "\"}";
        } catch (Exception e) {
            return "{\"error\":\"" + escapar(String.valueOf(e.getMessage())) + "\"}";
        }
    }

    /**
     * Inicia la descarga de la APK. Devuelve "ok" o "error:<motivo>".
     * El progreso se consulta con {@link #estadoJson()}.
     */
    public String descargar(String url, String sha256, int versionCode) {
        try {
            if (url == null || !url.startsWith("https://")) {
                return "error:La descarga debe usar HTTPS.";
            }
            if (sha256 == null || sha256.length() != 64) {
                return "error:Falta la huella de integridad (SHA-256).";
            }
            if (versionCode <= 0) {
                return "error:Versión de destino inválida.";
            }

            limpiarDescarga(false);
            shaEsperada = sha256.toLowerCase(Locale.US);
            versionEsperada = versionCode;

            File carpeta = new File(
                    contexto.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                    "actualizaciones");
            if (!carpeta.exists() && !carpeta.mkdirs()) {
                return "error:No se pudo preparar la carpeta de descarga.";
            }
            File[] anteriores = carpeta.listFiles();
            if (anteriores != null) {
                for (File f : anteriores) {
                    f.delete();
                }
            }
            archivoDescarga = new File(carpeta, "gestorpos-" + versionCode + ".apk");

            DownloadManager.Request peticion = new DownloadManager.Request(Uri.parse(url));
            peticion.setTitle("GestorPOS " + versionCode);
            peticion.setDescription("Descargando la actualización…");
            peticion.setMimeType("application/vnd.android.package-archive");
            peticion.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE);
            peticion.setDestinationInExternalFilesDir(
                    contexto,
                    Environment.DIRECTORY_DOWNLOADS,
                    "actualizaciones/" + archivoDescarga.getName());
            peticion.setAllowedOverRoaming(false);

            gestorDescargas = (DownloadManager) contexto.getSystemService(Context.DOWNLOAD_SERVICE);
            if (gestorDescargas == null) {
                return "error:El gestor de descargas no está disponible.";
            }
            idDescarga = gestorDescargas.enqueue(peticion);
            estado = ESTADO_DESCARGANDO;
            mensaje = "";
            progreso = 0;
            registrarReceptor();
            return "ok";
        } catch (Exception e) {
            estado = ESTADO_ERROR;
            mensaje = String.valueOf(e.getMessage());
            return "error:" + mensaje;
        }
    }

    /** Estado actual: descargando | verificando | listo | permiso | error | inactivo. */
    public String estadoJson() {
        if (ESTADO_DESCARGANDO.equals(estado) && idDescarga > 0 && gestorDescargas != null) {
            actualizarProgreso();
        }
        return "{\"estado\":\"" + estado + "\",\"progreso\":" + progreso
                + ",\"mensaje\":\"" + escapar(mensaje) + "\"}";
    }

    /**
     * Abre el instalador del APK ya verificado. Devuelve "ok", "permiso"
     * (hay que conceder «instalar apps desconocidas») o "error:<motivo>".
     */
    public String instalar() {
        if (!ESTADO_LISTO.equals(estado) || archivoDescarga == null || !archivoDescarga.exists()) {
            return "error:No hay una actualización verificada.";
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && !contexto.getPackageManager().canRequestPackageInstalls()) {
            estado = ESTADO_PERMISO;
            mensaje = "Permite instalar apps desde GestorPOS.";
            abrirAjustesInstalacion();
            return "permiso";
        }
        return lanzarInstalador() ? "ok" : "error:" + mensaje;
    }

    /** Abre Ajustes → Instalar apps desconocidas → GestorPOS. */
    public String ajustes() {
        abrirAjustesInstalacion();
        return "ok";
    }

    /** Cancela la descarga en curso y borra el archivo parcial. */
    public String cancelar() {
        limpiarDescarga(true);
        estado = ESTADO_INACTIVO;
        mensaje = "";
        progreso = 0;
        return "ok";
    }

    /** Libera el receptor de descargas. Se llama desde el onDestroy de la Activity. */
    public void destruir() {
        if (receptorDescarga == null) {
            return;
        }
        try {
            contexto.unregisterReceiver(receptorDescarga);
        } catch (Exception ignorado) {
            // Ya estaba desregistrado.
        }
        receptorDescarga = null;
    }

    // ─── Descarga ──────────────────────────────────────────────────────────

    private void registrarReceptor() {
        if (receptorDescarga != null) {
            return;
        }
        receptorDescarga = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (id != idDescarga) {
                    return;
                }
                estado = ESTADO_VERIFICANDO;
                new Thread(ActualizadorApk.this::verificarArchivoDescargado).start();
            }
        };

        IntentFilter filtro = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) {
            contexto.registerReceiver(receptorDescarga, filtro, Context.RECEIVER_EXPORTED);
        } else {
            contexto.registerReceiver(receptorDescarga, filtro);
        }
    }

    private void actualizarProgreso() {
        Cursor cursor = null;
        try {
            cursor = gestorDescargas.query(new DownloadManager.Query().setFilterById(idDescarga));
            if (cursor == null || !cursor.moveToFirst()) {
                return;
            }
            long total = cursor.getLong(
                    cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
            long descargado = cursor.getLong(
                    cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            int estadoDescarga = cursor.getInt(
                    cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));

            if (total > 0) {
                progreso = (int) Math.min(100, descargado * 100 / total);
            }
            if (estadoDescarga == DownloadManager.STATUS_FAILED) {
                estado = ESTADO_ERROR;
                mensaje = "La descarga falló. Comprueba la conexión e inténtalo de nuevo.";
            } else if (estadoDescarga == DownloadManager.STATUS_SUCCESSFUL
                    && ESTADO_DESCARGANDO.equals(estado)) {
                // Respaldo por si el receptor no llegó (app en segundo plano):
                // el sondeo del frontend detecta que terminó y verifica igual.
                progreso = 100;
                estado = ESTADO_VERIFICANDO;
                new Thread(this::verificarArchivoDescargado).start();
            }
        } catch (Exception ignorado) {
            // La consulta de progreso no debe romper la descarga.
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    /** Se ejecuta fuera del hilo principal: hashing y lectura del APK. */
    private void verificarArchivoDescargado() {
        if (verificando) {
            return;
        }
        verificando = true;
        try {
            estado = ESTADO_VERIFICANDO;
            File archivo = archivoDescarga;

            VerificadorApk.Resultado resultado = verificador.verificar(
                    archivo,
                    shaEsperada,
                    versionEsperada,
                    versionInstaladaCode());

            if (!resultado.esValido()) {
                if (archivo != null) {
                    archivo.delete();
                }
                estado = ESTADO_ERROR;
                mensaje = resultado.motivo();
                return;
            }

            progreso = 100;
            mensaje = "";
            estado = ESTADO_LISTO;
        } finally {
            verificando = false;
        }
    }

    private long versionInstaladaCode() {
        try {
            PackageInfo info = contexto.getPackageManager()
                    .getPackageInfo(contexto.getPackageName(), 0);
            return VerificadorApk.codigoVersion(info);
        } catch (Exception e) {
            return 0;
        }
    }

    // ─── Instalación ───────────────────────────────────────────────────────

    private boolean lanzarInstalador() {
        try {
            Uri uri = FileProvider.getUriForFile(
                    contexto,
                    contexto.getPackageName() + ".fileprovider",
                    archivoDescarga);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            contexto.startActivity(intent);
            return true;
        } catch (Exception e) {
            mensaje = "No se pudo abrir el instalador: " + e.getMessage();
            return false;
        }
    }

    private void abrirAjustesInstalacion() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent intent = new Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + contexto.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                contexto.startActivity(intent);
            }
        } catch (Exception e) {
            // El usuario puede abrir los ajustes a mano; el frontend le indica
            // la ruta exacta (Ajustes → Apps → GestorPOS).
        }
    }

    private void limpiarDescarga(boolean borrarArchivo) {
        try {
            if (gestorDescargas != null && idDescarga > 0) {
                gestorDescargas.remove(idDescarga);
            }
        } catch (Exception ignorado) {
            // La descarga pudo terminar antes de cancelarla.
        }
        idDescarga = -1;
        if (borrarArchivo && archivoDescarga != null) {
            archivoDescarga.delete();
        }
        archivoDescarga = null;
    }

    private String escapar(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", " ")
                .replace("\r", " ");
    }
}
