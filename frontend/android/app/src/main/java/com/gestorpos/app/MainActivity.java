package com.gestorpos.app;

import android.Manifest;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.DisplayCutoutCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Locale;

/**
 * Puente de descargas.
 *
 * La app genera los reportes (CSV/PDF) y el respaldo JSON en el navegador como
 * Blob. Dentro de un WebView un enlace `blob:` no descarga nada por sí solo, así
 * que aquí se expone `AndroidDownloads.guardarBase64(...)` y el frontend lo usa
 * (frontend/src/utils/descargas.js). Los enlaces http(s) (por ejemplo el APK de
 * la página /descargar) se delegan al DownloadManager del sistema.
 *
 * Almacenamiento:
 *  - Android 10+ (API 29): MediaStore.Downloads. No requiere permisos.
 *  - Android 9 e inferiores: carpeta pública Descargas, que sí exige
 *    WRITE_EXTERNAL_STORAGE (declarado con maxSdkVersion=28).
 */
public class MainActivity extends BridgeActivity {

    private static final int REQ_ALMACENAMIENTO = 4101;

    private String pendienteNombre;
    private String pendienteMime;
    private byte[] pendienteBytes;
    private ActualizadorApk actualizador;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Mantiene el splash del sistema y aplica postSplashScreenTheme al
        // terminar, evitando el destello blanco antes de que pinte el WebView.
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        configurarPantallaCompleta();

        WebView webView = getBridge().getWebView();
        // Mismo fondo que el splash: si el WebView tarda en pintar, no hay flash blanco.
        webView.setBackgroundColor(0xFF0F172A);
        webView.addJavascriptInterface(new DescargasNativas(), "AndroidDownloads");
        actualizador = new ActualizadorApk(this);
        webView.addJavascriptInterface(new ActualizacionesNativas(), "AndroidUpdates");

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimetype, long contentLength) {
                // Los blob:/data: los resuelve el puente JS; aquí solo http(s).
                if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
                    return;
                }
                descargarConSistema(url, userAgent, contentDisposition, mimetype);
            }
        });
    }

    // ─── Pantalla completa (sin barra de estado ni de navegación) ─────────
    //
    // La app ocupa toda la pantalla y las barras del sistema solo aparecen de
    // forma transitoria al deslizar desde el borde (BEHAVIOR_SHOW_TRANSIENT_BARS
    // _BY_SWIPE). Como el contenido pasa a dibujarse bajo el lente de la cámara
    // (windowLayoutInDisplayCutoutMode=shortEdges), las insets reales se envían
    // al WebView como variables CSS (--inset-*), de modo que la interfaz reserva
    // ese espacio sin depender de env(safe-area-inset-*).

    private int insetTop = -1;
    private int insetRight = -1;
    private int insetBottom = -1;
    private int insetLeft = -1;

    private void configurarPantallaCompleta() {
        ocultarBarrasSistema();

        View decor = getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(decor, (v, insets) -> {
            int ancho = v.getWidth();
            int alto = v.getHeight();
            int top = 0;
            int derecha = 0;
            int abajo = 0;
            int izquierda = 0;

            // El lente (punch-hole) no siempre llega como inset "seguro": en
            // modo shortEdges el sistema lo da como rectángulo del recorte.
            DisplayCutoutCompat corte = insets.getDisplayCutout();
            if (corte != null) {
                List<Rect> recortes = corte.getBoundingRects();
                for (int i = 0; i < recortes.size(); i++) {
                    Rect r = recortes.get(i);
                    if (r.width() <= 0 || r.height() <= 0) continue;
                    if (r.left <= 0) {
                        izquierda = Math.max(izquierda, r.right);
                    } else if (r.right >= ancho) {
                        derecha = Math.max(derecha, ancho - r.left);
                    }
                    if (r.top <= 0) {
                        top = Math.max(top, r.bottom);
                    } else if (r.bottom >= alto) {
                        abajo = Math.max(abajo, alto - r.top);
                    }
                }
            }

            // Zona del gesto inferior: se reserva siempre para que el dock no
            // quede debajo de la píldora de navegación.
            Insets nav = insets.getInsetsIgnoringVisibility(WindowInsetsCompat.Type.navigationBars());
            abajo = Math.max(abajo, nav.bottom);

            float densidad = getResources().getDisplayMetrics().density;
            if (densidad <= 0) densidad = 1f;
            aplicarInsets(
                    Math.round(top / densidad),
                    Math.round(derecha / densidad),
                    Math.round(abajo / densidad),
                    Math.round(izquierda / densidad)
            );
            return insets;
        });
    }

    private void ocultarBarrasSistema() {
        Window ventana = getWindow();
        View decor = ventana.getDecorView();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsControllerCompat controlador =
                    WindowCompat.getInsetsController(ventana, decor);
            controlador.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            controlador.hide(WindowInsetsCompat.Type.systemBars());
        }

        // Compatibilidad (API < 30) y refuerzo del modo inmersivo.
        decor.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        );
    }

    private void aplicarInsets(int top, int derecha, int abajo, int izquierda) {
        if (top == insetTop && derecha == insetRight && abajo == insetBottom && izquierda == insetLeft) {
            return;
        }
        insetTop = top;
        insetRight = derecha;
        insetBottom = abajo;
        insetLeft = izquierda;
        inyectarInsets();
    }

    private void inyectarInsets() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        final WebView webView = getBridge().getWebView();
        final String js = String.format(Locale.US,
                "(function(){var s=document.documentElement.style;" +
                        "s.setProperty('--inset-top','%dpx');" +
                        "s.setProperty('--inset-right','%dpx');" +
                        "s.setProperty('--inset-bottom','%dpx');" +
                        "s.setProperty('--inset-left','%dpx');})()",
                insetTop, insetRight, insetBottom, insetLeft);
        webView.post(() -> webView.evaluateJavascript(js, null));
    }

    /** Refuerza las insets cuando el SPA termina de cargar o vuelve del fondo. */
    private void inyectarInsetsDiferido() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        WebView webView = getBridge().getWebView();
        webView.postDelayed(this::inyectarInsets, 400);
        webView.postDelayed(this::inyectarInsets, 1500);
    }

    @Override
    public void onResume() {
        super.onResume();
        ocultarBarrasSistema();
        inyectarInsetsDiferido();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Al cerrar el teclado o volver de otra app, Android puede mostrar
            // las barras: se vuelven a ocultar.
            ocultarBarrasSistema();
            inyectarInsetsDiferido();
        }
    }

    @Override
    public void onDestroy() {
        if (actualizador != null) {
            actualizador.destruir();
        }
        super.onDestroy();
    }

    /** Interfaz expuesta al JavaScript como `window.AndroidDownloads`. */
    public class DescargasNativas {

        @JavascriptInterface
        public String guardarBase64(String nombre, String mime, String base64) {
            try {
                if (base64 == null || base64.isEmpty()) {
                    return "error:sin-datos";
                }
                byte[] datos = Base64.decode(base64, Base64.DEFAULT);
                String archivo = nombreSeguro(nombre);
                String tipo = (mime == null || mime.isEmpty())
                        ? "application/octet-stream"
                        : mime;

                if (necesitaPermisoAlmacenamiento()) {
                    pendienteNombre = archivo;
                    pendienteMime = tipo;
                    pendienteBytes = datos;
                    pedirPermisoAlmacenamiento();
                    return "permiso-solicitado";
                }

                escribirEnDescargas(archivo, tipo, datos);
                avisar("Guardado en Descargas: " + archivo);
                return "ok";
            } catch (Exception e) {
                avisar("No se pudo guardar el archivo");
                return "error:" + e.getMessage();
            }
        }
    }

    // ─── Actualizaciones de la APK ────────────────────────────────────────
    //
    // La descarga, la verificación y la instalación viven en ActualizadorApk
    // (y la verificación pura en VerificadorApk). Esta clase solo expone el
    // puente que consume el JavaScript (services/actualizaciones.js).

    /** Interfaz expuesta al JavaScript como `window.AndroidUpdates`. */
    public class ActualizacionesNativas {

        @JavascriptInterface
        public String versionInstalada() {
            return actualizador.versionInstaladaJson();
        }

        @JavascriptInterface
        public String descargar(String url, String sha256, int versionCode) {
            return actualizador.descargar(url, sha256, versionCode);
        }

        @JavascriptInterface
        public String estado() {
            return actualizador.estadoJson();
        }

        @JavascriptInterface
        public String instalar() {
            return actualizador.instalar();
        }

        @JavascriptInterface
        public String ajustes() {
            return actualizador.ajustes();
        }

        @JavascriptInterface
        public String cancelar() {
            return actualizador.cancelar();
        }
    }

    private void descargarConSistema(String url, String userAgent,
                                     String contentDisposition, String mimetype) {
        try {
            String nombre = URLUtil.guessFileName(url, contentDisposition, mimetype);

            if (necesitaPermisoAlmacenamiento()) {
                pedirPermisoAlmacenamiento();
                avisar("Concede el almacenamiento y vuelve a tocar la descarga");
                return;
            }

            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle(nombre);
            request.setDescription("GestorPOS");
            request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, nombre);
            if (userAgent != null) {
                request.addRequestHeader("User-Agent", userAgent);
            }
            String cookie = CookieManager.getInstance().getCookie(url);
            if (cookie != null) {
                request.addRequestHeader("Cookie", cookie);
            }

            DownloadManager gestor =
                    (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (gestor != null) {
                gestor.enqueue(request);
                avisar("Descargando " + nombre + "…");
            }
        } catch (Exception e) {
            avisar("No se pudo iniciar la descarga");
        }
    }

    private String nombreSeguro(String nombre) {
        String limpio = (nombre == null ? "" : nombre)
                .replaceAll("[\\\\/:*?\"<>|]", "_")
                .trim();
        if (limpio.isEmpty()) {
            limpio = "gestorpos_" + System.currentTimeMillis() + ".dat";
        }
        return limpio;
    }

    private boolean necesitaPermisoAlmacenamiento() {
        return Build.VERSION.SDK_INT <= 28
                && ContextCompat.checkSelfPermission(
                        this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED;
    }

    private void pedirPermisoAlmacenamiento() {
        runOnUiThread(() -> ActivityCompat.requestPermissions(
                MainActivity.this,
                new String[] { Manifest.permission.WRITE_EXTERNAL_STORAGE },
                REQ_ALMACENAMIENTO));
    }

    /** Escribe el archivo donde el usuario lo encuentra: Descargas. */
    private void escribirEnDescargas(String nombre, String mime, byte[] datos) throws Exception {
        if (Build.VERSION.SDK_INT >= 29) {
            ContentValues valores = new ContentValues();
            valores.put(MediaStore.MediaColumns.DISPLAY_NAME, nombre);
            valores.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            valores.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

            Uri destino = getContentResolver()
                    .insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, valores);
            if (destino == null) {
                throw new Exception("No se pudo crear el archivo");
            }
            try (OutputStream salida = getContentResolver().openOutputStream(destino)) {
                if (salida == null) {
                    throw new Exception("No se pudo abrir el archivo");
                }
                salida.write(datos);
            }
            return;
        }

        File carpeta = Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_DOWNLOADS);
        if (!carpeta.exists() && !carpeta.mkdirs()) {
            throw new Exception("No se pudo crear la carpeta Descargas");
        }
        File archivo = new File(carpeta, nombre);
        try (FileOutputStream salida = new FileOutputStream(archivo)) {
            salida.write(datos);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions,
                                           int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode != REQ_ALMACENAMIENTO) {
            return;
        }

        boolean concedido = grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED;

        if (concedido && pendienteBytes != null) {
            try {
                escribirEnDescargas(pendienteNombre, pendienteMime, pendienteBytes);
                avisar("Guardado en Descargas: " + pendienteNombre);
            } catch (Exception e) {
                avisar("No se pudo guardar el archivo");
            }
        } else if (!concedido) {
            avisar("Sin permiso de almacenamiento no se pueden guardar los reportes");
        }

        pendienteNombre = null;
        pendienteMime = null;
        pendienteBytes = null;
    }

    private void avisar(String mensaje) {
        runOnUiThread(() -> Toast.makeText(getApplicationContext(), mensaje, Toast.LENGTH_SHORT).show());
    }
}
