package com.gestorpos.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.Locale;

/**
 * Verifica que un APK descargado es realmente una actualización de GestorPOS.
 *
 * Comprueba, en este orden: huella SHA-256, que sea una aplicación válida, que
 * el paquete sea el nuestro, que el versionCode coincida con el manifiesto y
 * sea mayor que el instalado, y que la firma coincida.
 *
 * No descarga, no borra archivos y no conoce el estado de la UI: devuelve un
 * {@link Resultado} y quien llama decide qué hacer.
 */
public final class VerificadorApk {

    /** Resultado inmutable de una verificación. */
    public static final class Resultado {
        private final boolean valido;
        private final String motivo;

        private Resultado(boolean valido, String motivo) {
            this.valido = valido;
            this.motivo = motivo;
        }

        public static Resultado valido() {
            return new Resultado(true, "");
        }

        public static Resultado invalido(String motivo) {
            return new Resultado(false, motivo);
        }

        public boolean esValido() {
            return valido;
        }

        public String motivo() {
            return motivo;
        }
    }

    private final Context contexto;

    public VerificadorApk(Context contexto) {
        this.contexto = contexto.getApplicationContext();
    }

    /**
     * @param archivo          APK descargado
     * @param shaEsperada      huella del manifiesto (64 hex)
     * @param versionEsperada  versionCode del manifiesto (0 = no comprobar)
     * @param versionInstalada versionCode de la app en ejecución
     */
    public Resultado verificar(File archivo, String shaEsperada, int versionEsperada,
                               long versionInstalada) {
        try {
            if (archivo == null || !archivo.exists()) {
                return Resultado.invalido("No se encontró el archivo descargado.");
            }

            if (shaEsperada == null || !calcularSha256(archivo).equalsIgnoreCase(shaEsperada)) {
                return Resultado.invalido("El archivo descargado está dañado (huella distinta).");
            }

            PackageManager pm = contexto.getPackageManager();
            PackageInfo info = pm.getPackageArchiveInfo(archivo.getAbsolutePath(), 0);
            if (info == null) {
                return Resultado.invalido("El archivo no es una aplicación válida.");
            }
            if (!contexto.getPackageName().equals(info.packageName)) {
                return Resultado.invalido("El archivo no corresponde a GestorPOS.");
            }

            long versionArchivo = codigoVersion(info);
            if (versionEsperada > 0 && versionArchivo != versionEsperada) {
                return Resultado.invalido("La versión descargada no coincide con el manifiesto.");
            }
            if (versionArchivo <= versionInstalada) {
                return Resultado.invalido("La actualización no es más reciente que la instalada.");
            }

            if (!firmaCoincide(pm, archivo)) {
                return Resultado.invalido("La firma del archivo no coincide con la de GestorPOS.");
            }

            return Resultado.valido();
        } catch (Exception e) {
            return Resultado.invalido("No se pudo verificar la actualización: " + e.getMessage());
        }
    }

    /** versionCode de un paquete, con compatibilidad para API < 28. */
    public static long codigoVersion(PackageInfo info) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            return info.getLongVersionCode();
        }
        return info.versionCode;
    }

    /**
     * Compara la firma del APK descargado con la de la app instalada. Si no se
     * puede leer (APK firmado solo con v2 en APIs antiguas) se deja pasar: el
     * instalador de Android rechazará igualmente una firma distinta.
     */
    private boolean firmaCoincide(PackageManager pm, File archivo) {
        try {
            Signature[] nuevas = firmasDe(pm, archivo.getAbsolutePath(), false);
            Signature[] actuales = firmasDe(pm, contexto.getPackageName(), true);
            if (nuevas == null || actuales == null || nuevas.length == 0 || actuales.length == 0) {
                return true;
            }
            String huellaInstalada = calcularSha256(actuales[0].toByteArray());
            for (Signature firma : nuevas) {
                if (huellaInstalada.equals(calcularSha256(firma.toByteArray()))) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return true;
        }
    }

    private Signature[] firmasDe(PackageManager pm, String rutaOPaquete, boolean instalada)
            throws PackageManager.NameNotFoundException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            int flags = PackageManager.GET_SIGNING_CERTIFICATES;
            PackageInfo info = instalada
                    ? pm.getPackageInfo(rutaOPaquete, flags)
                    : pm.getPackageArchiveInfo(rutaOPaquete, flags);
            if (info == null || info.signingInfo == null) {
                return null;
            }
            return info.signingInfo.hasMultipleSigners()
                    ? info.signingInfo.getApkContentsSigners()
                    : info.signingInfo.getSigningCertificateHistory();
        }
        PackageInfo info = instalada
                ? pm.getPackageInfo(rutaOPaquete, PackageManager.GET_SIGNATURES)
                : pm.getPackageArchiveInfo(rutaOPaquete, PackageManager.GET_SIGNATURES);
        return info == null ? null : info.signatures;
    }

    private String calcularSha256(File archivo) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream entrada = new FileInputStream(archivo)) {
            byte[] buffer = new byte[8192];
            int leidos;
            while ((leidos = entrada.read(buffer)) > 0) {
                digest.update(buffer, 0, leidos);
            }
        }
        return aHexadecimal(digest.digest());
    }

    private String calcularSha256(byte[] datos) throws Exception {
        return aHexadecimal(MessageDigest.getInstance("SHA-256").digest(datos));
    }

    private String aHexadecimal(byte[] datos) {
        StringBuilder texto = new StringBuilder(datos.length * 2);
        for (byte dato : datos) {
            texto.append(String.format(Locale.US, "%02x", dato));
        }
        return texto.toString();
    }
}
