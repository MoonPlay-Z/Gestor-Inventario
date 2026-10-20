# Reglas de ProGuard/R8 para GestorPOS.
#
# `minifyEnabled` está desactivado en release, pero estas reglas se dejan
# puestas: si algún día se activa la minificación, sin ellas R8 renombraría o
# eliminaría los métodos de los puentes `@JavascriptInterface`
# (window.AndroidDownloads y window.AndroidUpdates) y la app rompería en
# release sin ningún error de compilación.

# Puentes JavaScript ↔ Android de MainActivity.
-keepclassmembers class com.gestorpos.app.MainActivity$* {
    @android.webkit.JavascriptInterface <methods>;
}

# Regla general: cualquier método anotado como interfaz JS queda intacto.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*

# Conservar los nombres de las clases internas usadas por reflexión del WebView.
-keep class com.gestorpos.app.MainActivity { *; }
