import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { hasStreamVars, isDirectMediaUrl, resolveStreamUrl } from '../utils/player'

function loadWebTorrent() {
  return new Promise((resolve, reject) => {
    if (window.WebTorrent) return resolve(window.WebTorrent)
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/webtorrent@1.9.6/webtorrent.min.js'
    s.onload = () => (window.WebTorrent ? resolve(window.WebTorrent) : reject(new Error('WebTorrent não encontrado.')))
    s.onerror = () => reject(new Error('Falha ao carregar WebTorrent.'))
    document.head.appendChild(s)
  })
}

const ANNOUNCE_TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.files.fm:7073/announce',
  'wss://tracker.moeking.me:443/announce',
  'wss://peerhub.xyz/announce',
  'wss://tracker.novage.com.ua/announce',
]

const VIDEO_EXT_RE = /\.(mp4|webm|ogv|m4v|mov)$/i
const MKV_RE = /\.mkv$/i

function pickTorrentFile(torrent) {
  const videos = torrent.files.filter((f) => VIDEO_EXT_RE.test(f.name))
  if (videos.length === 0) return null
  return videos.sort((a, b) => (b.length || 0) - (a.length || 0))[0]
}

function formatSpeed(bytes) {
  if (!bytes) return '0 KB/s'
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB/s` : `${Math.round(bytes / 1024)} KB/s`
}

function WebTorrentPlayer({ source }) {
  const [status, setStatus] = useState('Carregando WebTorrent...')
  const [hint, setHint] = useState('')
  const [error, setError] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let client
    let torrent
    let statsTimer
    const timers = []
    const box = boxRef.current
    if (!box) return

    const video = document.createElement('video')
    video.playsInline = true
    video.controls = true
    video.autoplay = true
    video.className = 'w-full h-full absolute inset-0'
    box.appendChild(video)

    const started = () => {
      if (cancelled) return
      timers.forEach((t) => clearTimeout(t))
      if (statsTimer) clearInterval(statsTimer)
      setStatus('')
      setHint('')
    }

    video.addEventListener('playing', started)
    video.addEventListener('error', () => {
      if (!cancelled && video.error) {
        setError('O navegador não conseguiu decodificar o arquivo do torrent. Tente um vídeo em mp4/webm.')
      }
    })

    loadWebTorrent()
      .then((WebTorrent) => {
        if (cancelled) return
        client = new WebTorrent()
        client.on('error', () => {})

        const staleTimer = setTimeout(() => {
          if (!cancelled && !torrent) {
            setHint('Ainda sem resposta dos rastreadores. Confirme que o link é um magnet válido de um torrent ativo.')
          }
        }, 15000)
        timers.push(staleTimer)

        client.add(
          source,
          { announce: ANNOUNCE_TRACKERS },
          (t) => {
            if (cancelled) return
            torrent = t
            const file = pickTorrentFile(t)
            if (!file) {
              const mkv = t.files.some((f) => MKV_RE.test(f.name))
              setStatus('')
              setError(
                mkv
                  ? 'O torrent contém um vídeo em .mkv, formato que o navegador não reproduz. Procure uma versão em mp4/webm.'
                  : 'Nenhum arquivo de vídeo compatível (mp4/webm/ogv) foi encontrado no torrent.',
              )
              return
            }

            setStatus('Conectando aos pares e baixando...')

            const slowTimer = setTimeout(() => {
              if (cancelled) return
              setHint(
                'Se ficar em 0 pares por muito tempo, o torrent pode ter apenas peers TCP, que o navegador não alcança. Nesse caso, teste outro magnet ou use um link direto de vídeo.',
              )
            }, 20000)
            timers.push(slowTimer)

            statsTimer = setInterval(() => {
              if (cancelled) return
              const peers = torrent.numPeers || 0
              const pct = Math.min(100, Math.round((torrent.progress || 0) * 100))
              setStatus(
                pct >= 100
                  ? `${formatSpeed(torrent.downloadSpeed)} • arquivo carregado`
                  : `${formatSpeed(torrent.downloadSpeed)} • ${pct}% • ${peers} par(es)`,
              )
            }, 800)

            torrent.files.forEach((f) => typeof f.deselect === 'function' && f.deselect())
            if (typeof file.select === 'function') file.select()

            if (typeof file.renderTo === 'function') {
              file.renderTo(video, { autoplay: true, controls: true }, () => started())
            } else if (typeof file.getBlobURL === 'function') {
              file.getBlobURL((err, url) => {
                if (cancelled) return
                if (err) {
                  setError('Falha ao montar o vídeo do torrent.')
                  return
                }
                video.src = url
                video.play().catch(() => {})
                started()
              })
            } else {
              setError('WebTorrent não consegue reproduzir este arquivo.')
            }
          },
          (err) => {
            if (cancelled) return
            setStatus('')
            const msg = err?.message || ''
            setError(
              /^Invalid torrent identifier/i.test(msg)
                ? 'Link de torrent inválido. Use um magnet (magnet:?xt=urn:btih:...) ou a URL de um arquivo .torrent.'
                : msg || 'Falha ao carregar o torrent.',
            )
          },
        )
      })
      .catch((err) => {
        setStatus('')
        setError(err.message || 'Falha ao carregar o WebTorrent.')
      })

    return () => {
      cancelled = true
      timers.forEach((t) => clearTimeout(t))
      if (statsTimer) clearInterval(statsTimer)
      try {
        video.pause()
        video.remove()
        if (torrent) torrent.destroy()
        if (client) client.destroy()
      } catch {
        /* ignore */
      }
    }
  }, [source])

  if (error) {
    return (
      <div className="aspect-video grid place-items-center rounded-2xl bg-dark-900 dark:bg-dark-950 ring-1 ring-red-500/30 p-6">
        <div className="text-center text-red-400 max-w-lg">
          <Icon name="info" size={30} className="mx-auto" />
          <p className="mt-3 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
      <div ref={boxRef} className="absolute inset-0">
        {status && (
          <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none p-4">
            <div className="text-center">
              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 text-white text-sm">
                <Icon name="clock" size={16} className="animate-pulse text-primary-400" />
                {status}
              </p>
              {hint && (
                <p className="mt-3 mx-auto max-w-md px-4 py-2 rounded-xl bg-black/60 text-xs text-white/70">
                  <Icon name="info" size={12} className="inline mr-1 text-primary-400" />
                  {hint}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function resolveIframe(title) {
  if (hasStreamVars(title.streamUrl)) {
    return { url: resolveStreamUrl(title.streamUrl, { season: 1, episode: 1 }), vars: true }
  }
  return { url: resolveStreamUrl(title.streamUrl), vars: false }
}

function IframePlayer({ title, autoFocus }) {
  const { url, vars } = useMemo(() => resolveIframe(title), [title])
  return (
    <div className="relative aspect-video bg-black">
      <iframe
        src={url}
        title={`Assistir ${title.title}`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *; clipboard-write *"
        allowFullScreen
        webkitAllowFullScreen="true"
        mozAllowFullScreen="true"
        scrolling="no"
        referrerPolicy="origin"
      />
      {autoFocus && (
        <div className="pointer-events-none absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium">
          <span className="relative flex h-2 w-2 mr-1.5 inline-block">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
          </span>
          AO VIVO
        </div>
      )}
      {vars && (
        <p className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-xs text-white/50">
          Temporada 1 / Episódio 1 — use os seletores abaixo para trocar.
        </p>
      )}
    </div>
  )
}

function DirectPlayer({ src }) {
  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
      <video src={src} controls playsInline controlsList="nodownload" className="absolute inset-0 w-full h-full">
        Seu navegador não suporta reprodução de vídeo direta.
      </video>
    </div>
  )
}

export default function StreamPlayer({ title, autoFocus = false }) {
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)

  const vars = useMemo(() => hasStreamVars(title?.streamUrl), [title?.streamUrl])
  const src = useMemo(
    () => resolveStreamUrl(title?.streamUrl, vars ? { season, episode } : {}),
    [title?.streamUrl, vars, season, episode],
  )

  if (!title?.streamUrl || !src) {
    return (
      <div className="aspect-video grid place-items-center rounded-2xl bg-dark-900 dark:bg-dark-950 ring-1 ring-white/10 p-6">
        <div className="text-center">
          <Icon name="info" size={36} className="mx-auto text-dark-400" />
          <p className="mt-3 text-sm text-dark-500 dark:text-dark-400">
            Nenhuma URL de reprodução configurada para este título.
          </p>
          <p className="text-xs text-dark-400 mt-1">Configure em Admin → Conteúdo → editar título.</p>
        </div>
      </div>
    )
  }

  const isSeries = title.type === 'series'
  const kind = title.streamType || 'embed'
  const isDirect = kind === 'webtorrent' && isDirectMediaUrl(src)

  return (
    <div className="card overflow-hidden">
      {kind === 'direct' || isDirect ? (
        <DirectPlayer src={src} />
      ) : kind === 'webtorrent' ? (
        <WebTorrentPlayer source={src} />
      ) : (
        <IframePlayer title={title} autoFocus={autoFocus} />
      )}

      {isSeries && vars && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-dark-50 dark:bg-dark-800/60">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="input w-auto"
            aria-label="Temporada"
          >
            {Array.from({ length: title.seasons || 1 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>Temporada {s}</option>
            ))}
          </select>
          <select
            value={episode}
            onChange={(e) => setEpisode(Number(e.target.value))}
            className="input w-auto"
            aria-label="Episódio"
          >
            {Array.from({ length: title.episodes || 1 }, (_, i) => i + 1).map((e) => (
              <option key={e} value={e}>Episódio {e}</option>
            ))}
          </select>
          <span className="text-xs text-dark-500 dark:text-dark-400 ml-auto hidden sm:block">
            Use as marcas {'{season}'} e {'{episode}'} na URL para permitir troca de episódios.
          </span>
        </div>
      )}
    </div>
  )
}