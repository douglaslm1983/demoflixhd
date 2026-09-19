import { useCallback, useMemo, useState } from 'react'
import Icon from '../Icon'
import { useData } from '../../context/DataContext'
import { tmdbSearch, tmdbPopular, tmdbDetails, toTitle, tmdbImage } from '../../utils/tmdb'
import { posterPlaceholder } from '../../utils/placeholder'

async function withDetails(key, media, item, streamType, streamUrl) {
  const d = await tmdbDetails(key, media, item.id)
  return toTitle(d, media, streamType && streamUrl ? { streamType, streamUrl } : {})
}

export default function TmdbImporter({ apiKey }) {
  const { titles, addTitle } = useData()
  const [tab, setTab] = useState('search')
  const [streamType, setStreamType] = useState('embed')
  const [streamUrlTemplate, setStreamUrlTemplate] = useState('')

  const existing = useMemo(() => new Set(titles.map((t) => `${t.tmdb?.media}:${t.tmdb?.id}`)), [titles])
  const already = useCallback(
    (media, id) => existing.has(`${media}:${id}`),
    [existing],
  )

  const streamProps = { streamType, streamUrl: streamUrlTemplate }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-1">
            <Icon name="upload" size={18} className="text-primary-500" /> Importar do TMDB
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Adicione conteúdo manualmente por busca ou em massa pelos populares.
          </p>
        </div>
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary-500 hover:underline inline-flex items-center gap-1"
        >
          <Icon name="info" size={13} /> Obter chave TMDB
        </a>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5">
          URL de reprodução (opcional) <span className="text-dark-400 font-normal">— aplicada aos títulos importados</span>
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          {[
            { key: 'embed', label: 'Embed' },
            { key: 'iframe', label: 'Iframe' },
            { key: 'direct', label: 'Link direto' },
            { key: 'webtorrent', label: 'WebTorrent' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStreamType(t.key)}
              className={`px-2.5 py-2 rounded-lg border text-sm font-semibold transition-all ${
                streamType === t.key
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-dark-200 dark:border-dark-700 text-dark-500 dark:text-dark-400 hover:border-primary-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={streamUrlTemplate}
          onChange={(e) => setStreamUrlTemplate(e.target.value)}
          placeholder={
            streamType === 'direct'
              ? 'Ex.: https://exemplo.com/video.mp4'
              : streamType === 'webtorrent'
                ? 'Ex.: magnet:?xt=urn:btih:... ou https://exemplo.com/arquivo.torrent'
                : 'Ex.: https://exemplo.com/embed/{season}/{episode} ou trailer do YouTube'
          }
          className="input"
        />
        <p className="mt-1 text-xs text-dark-400">
          {streamType === 'embed' || streamType === 'iframe'
            ? 'Use {season}/{episode} para séries trocarem episódios no player.'
            : 'Tipo aplicado a todos os títulos importados.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-xl bg-dark-100 dark:bg-dark-800">
        {[
          { key: 'search', label: 'Busca manual', icon: 'search' },
          { key: 'bulk', label: 'Em massa', icon: 'trend' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-dark-900 text-primary-500 shadow'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'search' ? (
        <SearchTab apiKey={apiKey} already={already} addTitle={addTitle} streamProps={streamProps} />
      ) : (
        <BulkTab apiKey={apiKey} already={already} addTitle={addTitle} streamProps={streamProps} />
      )}
    </div>
  )
}

function SearchTab({ apiKey, already, addTitle, streamProps }) {
  const [media, setMedia] = useState('movie')
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const search = async (e) => {
    e?.preventDefault()
    if (!q.trim()) return
    setSearching(true)
    setError('')
    try {
      const data = await tmdbSearch(apiKey, media, q.trim())
      setResults(data.results || [])
    } catch (err) {
      setError(err.message || 'Falha na busca.')
    } finally {
      setSearching(false)
    }
  }

  const importOne = async (item) => {
    if (already(media, item.id)) {
      notify('Este título já está no catálogo.')
      return
    }
    setBusyId(item.id)
    try {
      const entry = await withDetails(apiKey, media, item, streamProps.streamType, streamProps.streamUrl)
      addTitle(entry)
      notify(`"${entry.title}" adicionado ao catálogo!`)
    } catch (err) {
      setError(err.message || 'Falha ao importar.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <form onSubmit={search} className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="grid grid-cols-2 gap-2 sm:w-56 shrink-0">
          {['movie', 'tv'].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => { setMedia(m); setResults([]) }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                media === m
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-dark-200 dark:border-dark-700 text-dark-500 dark:text-dark-400 hover:border-primary-400'
              }`}
            >
              {m === 'movie' ? 'Filmes' : 'Séries'}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Buscar ${media === 'movie' ? 'filme' : 'série'} no TMDB...`}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Icon name="search" size={16} /> {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1">
          {results.map((item) => {
            const done = already(media, item.id)
            return (
              <div key={item.id} className="card overflow-hidden">
                <div className="aspect-[2/3] bg-dark-100 dark:bg-dark-800">
                  {item.poster_path ? (
                    <img
                      src={tmdbImage(item.poster_path, 'w342')}
                      alt={item.title || item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <img src={posterPlaceholder(item.id, item.title || item.name)} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{media === 'movie' ? item.title : item.name}</p>
                  <p className="text-xs text-dark-400 inline-flex items-center gap-1">
                    <Icon name="star" size={11} className="text-yellow-500" />
                    {Number(item.vote_average || 0).toFixed(1)} • {String(item.release_date || item.first_air_date || '').slice(0, 4) || '-'}
                  </p>
                  <button
                    onClick={() => importOne(item)}
                    disabled={busyId === item.id}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      done
                        ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    <Icon name={done ? 'check' : 'plus'} size={13} />
                    {busyId === item.id ? 'Importando...' : done ? 'Já adicionado' : 'Adicionar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!searching && results.length === 0 && !error && (
        <p className="text-sm text-dark-400 text-center py-8">
          Faça uma busca por título para adicionar ao catálogo.
        </p>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-medium shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  )
}

function BulkTab({ apiKey, already, addTitle, streamProps }) {
  const [media, setMedia] = useState('movie')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState([])
  const [toast, setToast] = useState('')

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const load = async (m = media, p = page) => {
    setLoading(true)
    setError('')
    try {
      const data = await tmdbPopular(apiKey, m, p)
      const list = data.results || []
      setItems(list)
      setSelected(list.filter((i) => already(m, i.id)).map((i) => `${m}:${i.id}`))
    } catch (err) {
      setError(err.message || 'Falha ao carregar populares.')
    } finally {
      setLoading(false)
    }
  }

  const switchMedia = (m) => {
    setMedia(m)
    setPage(1)
    setItems([])
    setSelected([])
    load(m, 1)
  }

  const toggle = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const toggleAll = () => {
    const all = items.map((i) => `${media}:${i.id}`)
    const every = all.every((k) => selected.includes(k))
    setSelected(every ? [] : all)
  }

  const importSelected = async () => {
    const pending = items.filter((i) => {
      const key = `${media}:${i.id}`
      return selected.includes(key) && !already(media, i.id)
    })
    if (pending.length === 0) {
      notify('Nenhum item novo selecionado.')
      return
    }
    setBusy(true)
    let ok = 0
    let fail = 0
    for (const item of pending) {
      try {
        const entry = await withDetails(apiKey, media, item, streamProps.streamType, streamProps.streamUrl)
        addTitle(entry)
        ok += 1
      } catch {
        fail += 1
      }
    }
    setBusy(false)
    notify(`${ok} importado${ok !== 1 ? 's' : ''}.${fail ? ` ${fail} falhou.` : ''}`)
    setItems([])
    setSelected([])
    load(media, page)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Catálogo:</span>
          <div className="grid grid-cols-2 gap-2 w-56">
            {['movie', 'tv'].map((m) => (
              <button
                key={m}
                onClick={() => switchMedia(m)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  media === m
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                    : 'border-dark-200 dark:border-dark-700 text-dark-500 dark:text-dark-400 hover:border-primary-400'
                }`}
              >
                {m === 'movie' ? 'Filmes' : 'Séries'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(media, page - 1)}
            disabled={page <= 1 || loading}
            className="p-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-500 dark:text-dark-400 hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-40"
            aria-label="Página anterior"
          >
            <Icon name="chevron-left" size={16} />
          </button>
          <span className="text-sm text-dark-500 dark:text-dark-400 w-20 text-center">Página {page}</span>
          <button
            onClick={() => load(media, page + 1)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-500 dark:text-dark-400 hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-40"
            aria-label="Próxima página"
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>

      {!loading && items.length === 0 && !error && (
        <button
          onClick={() => load()}
          className="w-full py-4 rounded-xl border-2 border-dashed border-dark-200 dark:border-dark-700 text-sm font-medium text-dark-500 dark:text-dark-400 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
        >
          <Icon name="trend" size={16} /> Carregar {media === 'movie' ? 'filmes' : 'séries'} populares
        </button>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-dark-400 text-center py-8">Carregando populares...</p>}

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={items.every((i) => selected.includes(`${media}:${i.id}`))}
                onChange={toggleAll}
                className="w-4 h-4 accent-primary-500"
              />
              <label>Selecionar todos ({items.length})</label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-400">{selected.length} selecionado{selected.length !== 1 && 's'}</span>
              <button
                onClick={importSelected}
                disabled={busy || selected.length === 0}
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 inline-flex items-center gap-2"
              >
                <Icon name="upload" size={16} /> {busy ? 'Importando...' : 'Importar selecionados'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[460px] overflow-y-auto pr-1">
            {items.map((item) => {
              const key = `${media}:${item.id}`
              const done = already(media, item.id)
              const checked = selected.includes(key)
              return (
                <div key={item.id} className={`card overflow-hidden transition-opacity ${done ? 'opacity-60' : ''}`}>
                  <div className="aspect-[2/3] bg-dark-100 dark:bg-dark-800">
                    {item.poster_path ? (
                      <img
                        src={tmdbImage(item.poster_path, 'w342')}
                        alt={item.title || item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={posterPlaceholder(item.id, item.title || item.name)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{media === 'movie' ? item.title : item.name}</p>
                    <p className="text-xs text-dark-400 inline-flex items-center gap-1">
                      <Icon name="star" size={11} className="text-yellow-500" />
                      {Number(item.vote_average || 0).toFixed(1)} • {String(item.release_date || item.first_air_date || '').slice(0, 4) || '-'}
                    </p>
                    <label className="mt-3 flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <span className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={done ? true : checked}
                          disabled={done}
                          onChange={() => toggle(key)}
                          className="w-4 h-4 accent-primary-500"
                        />
                        {!done && (
                          <span className="absolute left-5 whitespace-nowrap">
                            {done ? 'Já adicionado' : checked ? 'Selecionado' : ''}
                          </span>
                        )}
                      </span>
                      {done ? 'Já adicionado' : checked ? 'Selecionado' : 'Marcar'}
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-medium shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  )
}