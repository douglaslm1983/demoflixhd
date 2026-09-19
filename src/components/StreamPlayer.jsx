import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { hasStreamVars, resolveStreamUrl } from '../utils/player'

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

function WebTorrentPlayer({ source }) {
  const [status, setStatus] = useState('Carregando WebTorrent...')
  const [error, setError] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    let client
    let torrent
    let cancelled = false
    const box = boxRef.current
    const video = document.createElement('video')
    video.playsInline = true
    video.controls = true
    video.autoplay = true
    video.className = 'w-full h-full absolute inset-0'
    box.appendChild(video)

    loadWebTorrent()
      .then((WebTorrent) => {
        if (cancelled) return
        client = new WebTorrent()
        setStatus('Conectando aos pares...')
        client.add(source, (t) => {
          if (cancelled) return
          torrent = t
          setStatus(`Baixando ${t.name || 'torrent'}...`)
          const file =
            t.files.find((f) => /\.(mp4|webm|ogv)$/i.test(f.name)) || t.files[t.files.length - 1]
          if (!file) {
            setError('Nenhum vídeo encontrado no torrent.')
            return
          }
          if (!/\.(mp4|webm|ogv)$/i.test(file.name)) {
            setError(`Formato "${file.name.split('.').pop()}" não pode ser reproduzido no navegador. Prefira mp4/webm.`)
            return
          }
          const done = () => {
            if (!cancelled) setStatus('')
          }
          if (typeof file.renderTo === 'function') {
            file.renderTo(video, { autoplay: true, controls: true }, done)
          } else if (typeof file.getBlobURL === 'function') {
            file.getBlobURL((err, url) => {
              if (err) {
                setError('Falha ao montar o vídeo do torrent.')
                return
              }
              video.src = url
              video.play().catch(() => {})
              done()
            })
          } else {
            setError('WebTorrent nativo não suporta este arquivo.')
          }
        }, (err) => {
          if (!cancelled) {
            setStatus('')
            setError(err?.message || 'Falha ao carregar o torrent.')
          }
        })
      })
      .catch((err) => {
        setStatus('')
        setError(err.message || 'Falha ao carregar WebTorrent.')
      })

    return () => {
      cancelled = true
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
        <div className="text-center text-red-400">
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
          <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 text-white text-sm">
              <Icon name="clock" size={16} className="animate-pulse text-primary-400" />
              {status}
            </p>
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

  return (
    <div className="card overflow-hidden">
      {kind === 'direct' ? (
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