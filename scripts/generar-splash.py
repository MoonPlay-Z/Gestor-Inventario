#!/usr/bin/env python3
"""Genera el splash nativo de Android (logo + nombre del sistema).

Salida (todo reproducible desde `frontend/public/favicon.png`):

  frontend/android/app/src/main/res/drawable-nodpi/splash_logo.png
      Logo + «GestorPOS.dev» — se centra sobre el fondo de `drawable/splash.xml`
      (Android 8–11 y arranque de la activity).

  frontend/android/app/src/main/res/drawable-nodpi/splash_icon.png
      Solo el logo, con margen, para `windowSplashScreenAnimatedIcon`
      (Android 12+, donde el sistema lo recorta en círculo).

Uso:
    python3 scripts/generar-splash.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
FAVICON = RAIZ / "frontend/public/favicon.png"
DESTINO = RAIZ / "frontend/android/app/src/main/res/drawable-nodpi"
FUENTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

BLANCO = (255, 255, 255, 255)
CIELO = (56, 189, 248, 255)


def cargar_logo(lado: int) -> Image.Image:
    if not FAVICON.exists():
        raise SystemExit(f"No existe {FAVICON}")
    return Image.open(FAVICON).convert("RGBA").resize((lado, lado), Image.LANCZOS)


def generar_logo_con_nombre() -> None:
    """Logo arriba y «GestorPOS.dev» debajo, sobre fondo transparente."""
    ancho, alto = 900, 640
    lienzo = Image.new("RGBA", (ancho, alto), (0, 0, 0, 0))

    logo = cargar_logo(224)
    lienzo.alpha_composite(logo, ((ancho - 224) // 2, 70))

    fuente = ImageFont.truetype(FUENTE, 96)
    dibujo = ImageDraw.Draw(lienzo)

    base = dibujo.textbbox((0, 0), "GestorPOS", font=fuente)
    cola = dibujo.textbbox((0, 0), ".dev", font=fuente)
    ancho_base = base[2] - base[0]
    ancho_cola = cola[2] - cola[0]
    x = (ancho - (ancho_base + ancho_cola)) / 2
    y = 380 - base[1]

    dibujo.text((x, y), "GestorPOS", font=fuente, fill=BLANCO)
    dibujo.text((x + ancho_base, y), ".dev", font=fuente, fill=CIELO)

    # Recortar al contenido real y añadir margen: así el layer-list lo centra
    # ópticamente (sin aire muerto arriba o abajo).
    contenido = lienzo.crop(lienzo.getbbox())
    margen = 40
    final = Image.new(
        "RGBA",
        (contenido.width + margen * 2, contenido.height + margen * 2),
        (0, 0, 0, 0),
    )
    final.alpha_composite(contenido, (margen, margen))

    DESTINO.mkdir(parents=True, exist_ok=True)
    final.save(DESTINO / "splash_logo.png")
    print("splash_logo.png", final.size)


def generar_icono() -> None:
    """Logo solo, con margen para el recorte circular de Android 12."""
    lado = 512
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    logo = cargar_logo(288)  # ~56 % del lienzo: entra holgado en el círculo
    lienzo.alpha_composite(logo, ((lado - 288) // 2, (lado - 288) // 2))

    DESTINO.mkdir(parents=True, exist_ok=True)
    lienzo.save(DESTINO / "splash_icon.png")
    print("splash_icon.png", lienzo.size)


if __name__ == "__main__":
    generar_logo_con_nombre()
    generar_icono()
