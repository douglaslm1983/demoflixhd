const YT_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([\w-]{11})/

export function hasStreamVars(url = '') {
  return /\{season\}|\{episode\}/i.test(url)
}

export function resolveStreamUrl(raw = '', { season, episode } = {}) {
  let url = String(raw || '').trim()
  if (!url) return ''
  if (season != null) url = url.replace(/\{season\}/gi, season)
  if (episode != null) url = url.replace(/\{episode\}/gi, episode)
  const yt = url.match(YT_RE)
  if (yt) {
    const t = url.match(/[?&]t=(\d+)/)
    url = `https://www.youtube.com/embed/${yt[1]}${t ? `?start=${t[1]}` : ''}`
  }
  return url
}