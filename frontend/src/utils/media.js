/**
 * Utilidades de medios para Noticias.
 *
 * El panel guarda URLs (no archivos): imágenes externas, YouTube/Vimeo o un
 * video directo (.mp4/.webm/.ogg). Estas funciones normalizan la entrada y
 * deciden cómo debe pintarse en la landing.
 */

const ESQUEMA = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

function normalizarCandidata(url) {
  const limpia = String(url || '').trim();
  if (!limpia) return '';
  if (limpia.startsWith('//')) return `https:${limpia}`;
  if (limpia.startsWith('/')) return limpia;
  if (!ESQUEMA.test(limpia)) return `https://${limpia}`;
  return limpia;
}

/**
 * Devuelve un mensaje de error o `null` si la URL es válida.
 * Se aceptan http(s) y rutas internas que empiezan por `/`.
 */
export function validarUrlMedia(value, label = 'La URL') {
  if (!value || !String(value).trim()) return null;

  const url = String(value).trim();
  try {
    const parsed = new URL(normalizarCandidata(url), 'https://localhost');
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocolo no permitido');
    return null;
  } catch {
    return `${label} debe ser una URL http(s) válida o una ruta interna que empiece por /.`;
  }
}

/**
 * Clasifica una URL de video:
 *   - { tipo: 'iframe', src } → YouTube/Vimeo (se embebe)
 *   - { tipo: 'video',  src } → archivo directo (se pinta con <video>)
 *   - { tipo: 'link',   src } → cualquier otra URL (enlace "Ver video")
 * Devuelve `null` si no hay URL.
 */
export function parseVideoUrl(value) {
  const original = String(value || '').trim();
  if (!original) return null;

  const src = original.startsWith('/') ? original : normalizarCandidata(original);

  let parsed;
  try {
    parsed = new URL(src, 'https://localhost');
  } catch {
    return { tipo: 'link', src };
  }

  // Defensa adicional para datos antiguos: nunca devolver enlaces javascript:,
  // data: u otros esquemas peligrosos.
  if (!['http:', 'https:'].includes(parsed.protocol)) return null;

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const segmentos = parsed.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    const id = segmentos[0];
    if (id) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${encodeURIComponent(id)}` };
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    let id = parsed.searchParams.get('v');
    if (!id && ['shorts', 'embed', 'live'].includes(segmentos[0])) id = segmentos[1];
    if (id) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${encodeURIComponent(id)}` };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = [...segmentos].reverse().find((segmento) => /^\d+$/.test(segmento));
    if (id) return { tipo: 'iframe', src: `https://player.vimeo.com/video/${id}` };
  }

  if (/\.(mp4|webm|ogv|ogg)$/i.test(parsed.pathname)) {
    return { tipo: 'video', src };
  }

  return { tipo: 'link', src };
}
