import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import PosterCard from '../../components/PosterCard'
import DetailModal from '../../components/DetailModal'
import WatchModal from '../../components/WatchModal'
import Icon from '../../components/Icon'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const { search } = useData()
  const q = params.get('q') || ''
  const [input, setInput] = useState('')
  const [lastQ, setLastQ] = useState(null)
  const [modalTitle, setModalTitle] = useState(null)
  const [watchTitle, setWatchTitle] = useState(null)

  if (lastQ !== q) {
    setLastQ(q)
    setInput(q)
  }

  const results = useMemo(() => search(q), [search, q])

  const submit = (e) => {
    e.preventDefault()
    setParams(input.trim() ? { q: input.trim() } : {})
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight mb-6">Busca</h1>

      <form onSubmit={submit} className="mb-8">
        <div className="relative max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon name="search" size={20} />
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pesquise por título, gênero, elenco..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-dark-100 dark:bg-dark-800 border border-transparent dark:border-dark-700 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {input && (
            <button onClick={() => { setInput(''); setParams({}) }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-dark-200 dark:hover:bg-dark-700" aria-label="Limpar">
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </form>

      {q && (
        <p className="mb-6 text-sm text-dark-500 dark:text-dark-400">
          {results.length} resultado{results.length !== 1 && 's'} para <strong className="text-dark-900 dark:text-dark-100">“{q}”</strong>
        </p>
      )}

      {!q ? (
        <div className="py-16 text-center">
          <Icon name="search" size={44} className="mx-auto text-dark-300 dark:text-dark-600" />
          <p className="mt-4 text-lg font-semibold">Digite algo para começar</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">Encontre filmes e séries pelo nome, gênero ou elenco.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center">
          <Icon name="x" size={44} className="mx-auto text-dark-300 dark:text-dark-600" />
          <p className="mt-4 text-lg font-semibold">Nada encontrado</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">Tente termos diferentes ou mais genéricos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
          {results.map((t) => (
            <PosterCard key={t.id} title={t} onMore={setModalTitle} width="w-full" />
          ))}
        </div>
      )}

      <DetailModal open={!!modalTitle} title={modalTitle} onClose={() => setModalTitle(null)} onContentClick={(t) => setWatchTitle(t)} />
      <WatchModal open={!!watchTitle} title={watchTitle} onClose={() => setWatchTitle(null)} />
    </div>
  )
}