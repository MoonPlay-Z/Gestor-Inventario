#!/usr/bin/env python3
"""Genera TODOS los iconos de marca (web + Android) desde una sola definición.

La fuente de verdad del diseño es `frontend/public/favicon.html` (SVG 64x64:
cajita azul, recibo blanco, carrito cian, tarjeta dorada, monograma "A").
Aquí se redibuja con PIL a 16x (1024 px) y se reduce con LANCZOS, así que sale
nítido en cualquier tamaño. No necesita ImageMagick, rsvg ni sharp.

Salidas
-------
frontend/public/favicon.png                 200  esquinas transparentes
frontend/public/pwa-192.png                 192  esquinas transparentes
frontend/public/pwa-512.png                 512  esquinas transparentes
frontend/public/pwa-maskable-512.png        512  sangrado total, contenido al 70 %
frontend/public/apple-touch-icon.png        180  sangrado total
frontend/android/app/src/main/res/mipmap-<d>/ic_launcher.png          48/72/96/144/192
frontend/android/app/src/main/res/mipmap-<d>/ic_launcher_round.png    48/72/96/144/192
frontend/android/app/src/main/res/mipmap-<d>/ic_launcher_foreground.png 108/162/216/324/432

Uso:  python3 scripts/generar-iconos.py
"""

import os

import numpy as np
from PIL import Image, ImageDraw

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLICO = os.path.join(RAIZ, "frontend", "public")
RES = os.path.join(RAIZ, "frontend", "android", "app", "src", "main", "res")

K = 16  # supersampling: 64 unidades * 16 = 1024 px de lienzo

# Colores del SVG (favicon.html)
AZUL_A, AZUL_B = (0x3B, 0x82, 0xF6), (0x1D, 0x4E, 0xD8)
CIAN_A, CIAN_B = (0x38, 0xBD, 0xF8), (0x06, 0xB6, 0xD4)
ORO_A, ORO_B = (0xFD, 0xE0, 0x47), (0xF5, 0x9E, 0x0B)
BLANCO = (255, 255, 255, 255)
TINTA = (0x0F, 0x17, 0x2A, 255)
CHIP = (0x25, 0x63, 0xEB, 255)
ORO_LINEA = (0xF5, 0x9E, 0x0B, 255)
AZUL_LINEA = (0x1D, 0x4E, 0xD8, 255)
CIAN_PUNTO = (0x38, 0xBD, 0xF8, 255)

MIPMAPS = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}


def gradiente(w, h, c1, c2):
    """Gradiente lineal diagonal (0,0)->(w,h), como objectBoundingBox del SVG."""
    w, h = max(int(w), 1), max(int(h), 1)
    if w == 1 and h == 1:
        t = np.zeros((1, 1))
    else:
        yy, xx = np.mgrid[0:h, 0:w]
        t = (xx / max(w - 1, 1) + yy / max(h - 1, 1)) / 2.0
    t = t[..., None]
    a, b = np.array(c1, float), np.array(c2, float)
    rgb = np.clip(a * (1 - t) + b * t, 0, 255).round().astype(np.uint8)
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = rgb
    out[..., 3] = 255
    return Image.fromarray(out, "RGBA")


def capa_gradiente(W, bbox, c1, c2, pintar):
    """Capa RGBA WxW con el gradiente recortado a la forma que dibuja `pintar`.

    El gradiente se calcula sobre el `bbox` (en unidades 64) igual que hace el
    `objectBoundingBox` del SVG.
    """
    mascara = Image.new("L", (W, W), 0)
    pintar(ImageDraw.Draw(mascara))
    x0, y0, x1, y1 = (int(round(v * K)) for v in bbox)
    recorte = mascara.crop((x0, y0, x1, y1))
    g = gradiente(x1 - x0, y1 - y0, c1, c2)
    capa = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    capa.paste(g, (x0, y0), recorte)
    return capa


def capa_fondo(W, modo):
    """Fondo del icono en unidades 64. Modos: squircle / recto / circulo / nada."""
    if modo == "nada":
        return Image.new("RGBA", (W, W), (0, 0, 0, 0))
    if modo == "recto":
        forma = lambda d: d.rectangle([0, 0, 64 * K - 1, 64 * K - 1], fill=255)
    elif modo == "circulo":
        forma = lambda d: d.ellipse([0, 0, 64 * K - 1, 64 * K - 1], fill=255)
    else:  # squircle
        forma = lambda d: d.rounded_rectangle(
            [0, 0, 64 * K - 1, 64 * K - 1], radius=16 * K, fill=255
        )
    return capa_gradiente(W, (0, 0, 64, 64), AZUL_A, AZUL_B, forma)


def capa_tarjeta(W):
    """Tarjeta dorada girada 12° sobre (36,7), como el SVG."""
    mascara = Image.new("L", (W, W), 0)
    ImageDraw.Draw(mascara).rounded_rectangle(
        [36 * K, 7 * K, 52 * K, 17 * K], radius=2 * K, fill=255
    )
    mascara = mascara.rotate(-12, center=(36 * K, 7 * K), resample=Image.BICUBIC)
    capa = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    return Image.composite(gradiente(W, W, ORO_A, ORO_B), capa, mascara)


def capa_contenido(W):
    """Recibo + chip + tarjeta + carrito + monograma + manija + ruedas."""
    c = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    # Recibo blanco con chip
    d.rounded_rectangle([14 * K, 10 * K, 50 * K, 52 * K], radius=5 * K, fill=BLANCO)
    d.ellipse([29.5 * K, 13.5 * K, 34.5 * K, 18.5 * K], fill=CHIP)
    # Tarjeta entrando por la ranura
    c = Image.alpha_composite(c, capa_tarjeta(W))
    # Cuerpo del carrito (cian)
    c = Image.alpha_composite(
        c,
        capa_gradiente(
            W,
            (24, 25, 44, 37),
            CIAN_A,
            CIAN_B,
            lambda d: d.polygon(
                [(20 * K, 25 * K), (44 * K, 25 * K), (40 * K, 37 * K), (24 * K, 37 * K)],
                fill=255,
            ),
        ),
    )
    d = ImageDraw.Draw(c)
    # Monograma "A" dorado
    d.line(
        [(28 * K, 37 * K), (32 * K, 27 * K), (36 * K, 37 * K)],
        fill=ORO_LINEA,
        width=max(1, round(2.5 * K)),
        joint="curve",
    )
    d.line(
        [(29.5 * K, 34 * K), (34.5 * K, 34 * K)],
        fill=ORO_LINEA,
        width=max(1, round(1.8 * K)),
    )
    # Manija / marco azul
    d.line(
        [(46 * K, 21 * K), (43 * K, 25 * K), (39 * K, 42 * K), (23 * K, 42 * K)],
        fill=AZUL_LINEA,
        width=max(1, round(2.8 * K)),
        joint="curve",
    )
    # Ruedas
    for cx in (26, 38):
        d.ellipse(
            [(cx - 3.2) * K, 42.8 * K, (cx + 3.2) * K, 49.2 * K], fill=TINTA
        )
        d.ellipse(
            [(cx - 1.2) * K, 44.8 * K, (cx + 1.2) * K, 47.2 * K], fill=CIAN_PUNTO
        )
    return c


def reducir(img, size):
    """Resize RGBA con alfa premultiplicado (evita halos oscuros en los bordes)."""
    a = np.array(img, dtype=np.float32, copy=True)
    alfa = a[..., 3:4] / 255.0
    a[..., :3] *= alfa
    prem = Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8), "RGBA")
    prem = prem.resize(size, Image.LANCZOS)
    b = np.array(prem, dtype=np.float32)
    al = np.maximum(b[..., 3:4], 1e-6) / 255.0
    b[..., :3] = np.clip(b[..., :3] / al, 0, 255)
    return Image.fromarray(b.round().astype(np.uint8), "RGBA")


def icono(size, fondo="squircle", escala=1.0):
    """Renderiza el icono al tamaño pedido."""
    W = 64 * K
    base = capa_fondo(W, fondo)
    cont = capa_contenido(W)
    if escala != 1.0:
        lado = int(round(W * escala))
        reducido = reducir(cont, (lado, lado))
        cont = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        cont.paste(reducido, ((W - lado) // 2, (W - lado) // 2), reducido)
    return reducir(Image.alpha_composite(base, cont), (size, size))


def guardar(img, ruta):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    img.save(ruta, "PNG", optimize=True)
    print(f"  {os.path.relpath(ruta, RAIZ):62} {img.size[0]:>4}x{img.size[1]}")


def main():
    print("Web (frontend/public):")
    guardar(icono(200, "squircle"), os.path.join(PUBLICO, "favicon.png"))
    guardar(icono(192, "squircle"), os.path.join(PUBLICO, "pwa-192.png"))
    guardar(icono(512, "squircle"), os.path.join(PUBLICO, "pwa-512.png"))
    guardar(icono(512, "recto", 0.70), os.path.join(PUBLICO, "pwa-maskable-512.png"))
    guardar(icono(180, "recto", 0.90), os.path.join(PUBLICO, "apple-touch-icon.png"))

    print("Android (mipmap-*):")
    for d, (lado, fg) in MIPMAPS.items():
        carpeta = os.path.join(RES, f"mipmap-{d}")
        guardar(icono(lado, "squircle"), os.path.join(carpeta, "ic_launcher.png"))
        guardar(icono(lado, "circulo", 0.76), os.path.join(carpeta, "ic_launcher_round.png"))
        guardar(icono(fg, "nada", 0.70), os.path.join(carpeta, "ic_launcher_foreground.png"))
    print("\nListo.")


if __name__ == "__main__":
    main()
