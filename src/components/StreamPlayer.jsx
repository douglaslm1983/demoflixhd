import { useMemo, useState } from 'react'
import Icon from './Icon'
import { hasStreamVars, resolveStreamUrl } from '../utils/player'

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

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-video bg-black">
        <iframe
          src={src}
          title={`Assistir ${title.title}${isSeries && vars ? ` - T${season}E${episode}` : ''}`}
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
      </div>

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