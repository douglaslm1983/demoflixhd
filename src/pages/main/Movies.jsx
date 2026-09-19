import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import PosterCard from '../../components/PosterCard'
import DetailModal from '../../components/DetailModal'
import WatchModal from '../../components/WatchModal'
import Icon from '../../components/Icon'
import { RatingStars } from '../../components/Rating'

export default function Movies() {
  return <CatalogPage type="movie" title="Filmes" description="Explore o catálogo completo de filmes" />
}

function CatalogPage({ type, title, description }) {
  const { movies, series } = useData()
  const [params, setParams] = useSearchParams()
  const items = type === 'movie' ? movies : series

  const genre = params.get('g') || 'Todos'
  const [sort, setSort] = useState('recent')
  const [modalTitle, setModalTitle] = useState(null)
  const [watchTitle, setWatchTitle] = useState(null)

  const availableGens = useMemo(() => {
    const set = new Set()
    items.forEach((t) => t.genres.forEach((g) => set.add(g)))
    return ['Todos', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    let out = genre === 'Todos' ? items : items.filter((t) => t.genres.includes(genre))
    if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating)
    else if (sort === 'title') out = [...out].sort((a, b) => a.title.localeCompare(b.title))
    else out = [...out].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    return out
  }, [items, genre, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8 animate-slide-up">
        <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-dark-500 dark:text-dark-400">{description}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
          <RatingStars value={type === 'movie' ? (items.length ? items.reduce((a, t) => a + (t.rating || 0), 0) / items.length : 0) : 0} size={13} />
          <span>{items.length} título{items.length !== 1 && 's'} no acervo</span>
        </div>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {availableGens.map((g) => (
            <button
              key={g}
              onClick={() => setParams(g === 'Todos' ? {} : { g })}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                genre === g
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="shrink-0 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 border border-transparent dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Ordenar por"
        >
          <option value="recent">Mais recentes</option>
          <option value="rating">Melhor avaliação</option>
          <option value="title">Título (A-Z)</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
          {filtered.map((t, i) => (
            <div key={t.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
              <PosterCard title={t} onMore={setModalTitle} width="w-full" />
            </div>
          ))}
        </div>
      )}

      <DetailModal open={!!modalTitle} title={modalTitle} onClose={() => setModalTitle(null)} onContentClick={(t) => setWatchTitle(t)} />
      <WatchModal open={!!watchTitle} title={watchTitle} onClose={() => setWatchTitle(null)} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <Icon name="search" size={40} className="mx-auto text-dark-300 dark:text-dark-600" />
      <p className="mt-4 text-lg font-semibold">Nenhum resultado encontrado</p>
      <p className="text-sm text-dark-500 dark:text-dark-400">Tente outro gênero ou categoria.</p>
    </div>
  )
}