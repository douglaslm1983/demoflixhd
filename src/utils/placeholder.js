const PALETTES = [
  ['#0f2027', '#2c5364'],
  ['#1a2980', '#26d0ce'],
  ['#41295a', '#2f0743'],
  ['#141e30', '#243b55'],
  ['#870000', '#190a05'],
  ['#355c7d', '#6c5b7b'],
  ['#232526', '#414345'],
  ['#2c3e50', '#3498db'],
  ['#c33764', '#1d2671'],
  ['#134e5e', '#71b280'],
  ['#7b4397', '#dc2430'],
  ['#1f1c2c', '#928dab'],
]

export function stringHash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function escapeXml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function seedParams(seed) {
  const plain = typeof seed === 'string' ? seed : String(seed || 'x')
  const h = stringHash(plain)
  const palette = PALETTES[h % PALETTES.length]
  return { plain, palette }
}

export function posterPlaceholder(seed = '', title = '') {
  const { plain, palette } = seedParams(seed || title || 'x')
  const [c1, c2] = palette
  const label = escapeXml((title || 'Sem título').slice(0, 42))
  const mono = escapeXml((plain || 'demo').slice(0, 12))
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
    `<rect width="400" height="600" fill="url(#g)"/>` +
    `<circle cx="70" cy="80" r="150" fill="#ffffff" opacity="0.06"/>` +
    `<circle cx="360" cy="520" r="180" fill="#000000" opacity="0.18"/>` +
    `<rect x="0" y="0" width="400" height="600" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2"/>` +
    `<g fill="none" stroke="#ffffff" stroke-opacity="0.18">` +
    `<path d="M300 -40 L380 40 M340 -80 L420 0 M380 -120 L460 -40" />` +
    `<path d="M-40 620 L40 700 M0 580 L80 660 M40 540 L120 620" />` +
    `</g>` +
    `<text x="200" y="270" text-anchor="middle" fill="#ffffff" opacity="0.9" font-family="Arial, sans-serif" font-size="64">▶</text>` +
    `<text x="22" y="530" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="bold">${label}</text>` +
    `<text x="22" y="558" fill="#ffffff" opacity="0.7" font-family="Arial, sans-serif" font-size="14" letter-spacing="2">${mono.toUpperCase()}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function backdropPlaceholder(seed = '', title = '') {
  const { plain, palette } = seedParams(seed || title || 'x')
  const [c1, c2] = palette
  const label = escapeXml((title || 'Sem título').slice(0, 60))
  const mono = escapeXml((plain || 'demo').slice(0, 12))
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
    `<rect width="1280" height="720" fill="url(#g)"/>` +
    `<circle cx="140" cy="120" r="260" fill="#ffffff" opacity="0.07"/>` +
    `<circle cx="1150" cy="640" r="320" fill="#000000" opacity="0.22"/>` +
    `<rect x="0" y="0" width="1280" height="720" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>` +
    `<g fill="none" stroke="#ffffff" stroke-opacity="0.16">` +
    `<path d="M980 -60 L1160 120 M1060 -120 L1240 60 M900 -180 L1080 0" />` +
    `</g>` +
    `<polygon points="610,300 610,420 700,360" fill="#ffffff" opacity="0.85"/>` +
    `<text x="90" y="520" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="bold">${label}</text>` +
    `<text x="94" y="580" fill="#ffffff" opacity="0.75" font-family="Arial, sans-serif" font-size="20" letter-spacing="4">${mono.toUpperCase()}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const AVATAR_COLORS = ['#ed811b', '#7c3aed', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b']

export function avatarPlaceholder(name = '') {
  const f = name.trim().split(/\s+/)
  const initials = f.length > 1 ? (f[0][0] + f[f.length - 1][0]).toUpperCase() : (name[0] || '?').toUpperCase()
  const h = stringHash(name || 'user')
  const color = AVATAR_COLORS[h % AVATAR_COLORS.length]
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
    `<circle cx="48" cy="48" r="48" fill="${color}"/>` +
    `<text x="48" y="60" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${escapeXml(initials)}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}