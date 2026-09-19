import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import { MetaBadge, RatingStars } from '../../components/Rating'
import Carousel from '../../components/Carousel'
import DetailModal from '../../components/DetailModal'
import WatchModal from '../../components/WatchModal'
import StreamPlayer from '../../components/StreamPlayer'
import { backdropPlaceholder, posterPlaceholder } from '../../utils/placeholder'

export default function Details() {
  const { type, id } = useParams()
  const { getTitle, titles, toggleMyList, isInMyList } = useData()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const title = getTitle(type, id)
  const [backdropImg, setBackdropImg] = useState('')
  const [posterImg, setPosterImg] = useState('')
  const [watchTitle, setWatchTitle] = useState(null)
  const [modalTitle, setModalTitle] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const toggle = () => {
    if (!isAuthenticated) {
      navigate('/entrar')
      return
    }
    toggleMyList(title.id)
  }

  if (!title) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <Icon name="info" size={44} className="mx-auto text-dark-300 dark:text-dark-600" />
        <h1 className="mt-4 text-3xl font-display font-bold">Título não encontrado</h1>
        <p className="mt-2 text-dark-500 dark:text-dark-400">O conteúdo que você procura não existe mais no catálogo.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600">
          <Icon name="home" size={16} /> Voltar ao início
        </Link>
      </div>
    )
  }

  const inList = isInMyList(title.id)
  const similar = titles
    .filter((t) => t.type === title.type && t.id !== title.id && t.genres.some((g) => title.genres.includes(g)))
    .slice(0, 12)

  const poster = posterImg || title.poster || posterPlaceholder(title.slug, title.title)
  const backdrop = backdropImg || title.backdrop || backdropPlaceholder(title.slug, title.title)

  const metaInfo = [
    { icon: 'calendar', label: 'Ano', value: title.year },
    { icon: title.type === 'movie' ? 'clock' : 'tv', label: title.type === 'movie' ? 'Duração' : 'Temporadas', value: title.type === 'movie' ? `${Math.floor(title.duration / 60)}h ${title.duration % 60}min` : title.seasons },
    { icon: 'star', label: 'Avaliação', value: Number(title.rating || 0).toFixed(1) },
    { icon: 'film', label: 'Qualidade', value: title.quality },
  ]

  return (
    <div>
      <section className="relative h-[380px] md:h-[480px] overflow-hidden -mt-2">
        <img src={backdrop} alt={title.title} onError={() => setBackdropImg(backdropPlaceholder(title.slug, title.title))} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-50 dark:from-dark-950 via-dark-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex items-end gap-4">
              <div className="relative w-28 sm:w-36 md:w-44 shrink-0 hidden sm:block">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 rotate-[-3deg]">
                  <img src={poster} alt={title.title} onError={() => setPosterImg(posterPlaceholder(title.slug, title.title))} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-wider">
                    <Icon name={title.type === 'movie' ? 'film' : 'tv'} size={13} />
                    {title.type === 'movie' ? 'Filme' : 'Série'}
                  </span>
                  <MetaBadge ageRating={title.ageRating} quality={title.quality} />
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight drop-shadow-lg">{title.title}</h1>
                {title.originalTitle !== title.title && (
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{title.originalTitle}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-sm text-dark-700 dark:text-dark-200 flex-wrap">
                  <RatingStars value={title.rating} showValue size={16} />
                  <span className="flex items-center gap-1"><Icon name="calendar" size={14} /> {title.year}</span>
                  <span className="hidden md:flex items-center gap-1 flex-wrap">{title.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded bg-white/10 dark:bg-dark-900/60 text-xs">{g}</span>
                  ))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setWatchTitle(title)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600 transition-all active:scale-95"
            >
              <Icon name="play" size={17} /> Assistir agora
            </button>
            <button
              onClick={toggle}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all active:scale-95 ${
                inList
                  ? 'bg-primary-500/10 border-primary-500/40 text-primary-500'
                  : 'border-dark-300 dark:border-dark-700 hover:border-primary-500 hover:text-primary-500'
              }`}
            >
              <Icon name={inList ? 'check' : 'plus'} size={17} />
              {inList ? 'Na minha lista' : 'Adicionar à minha lista'}
            </button>
          </div>

          {title.streamUrl && (
            <div className="mb-8">
              <StreamPlayer title={title} />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-display font-bold mb-3">Sinopse</h2>
            <p className={`text-dark-600 dark:text-dark-300 leading-relaxed ${expanded ? '' : 'line-clamp-6'}`}>
              {title.synopsis}
            </p>
            {title.synopsis.length > 260 && (
              <button onClick={() => setExpanded((v) => !v)} className="mt-2 text-primary-500 text-sm font-medium hover:underline">
                {expanded ? 'Mostrar menos' : 'Ler mais'}
              </button>
            )}
          </div>

          {title.cast?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-display font-bold mb-3">Elenco principal</h2>
              <div className="flex flex-wrap gap-2">
                {title.cast.map((c) => (
                  <span key={c} className="px-4 py-2 rounded-full bg-dark-100 dark:bg-dark-800 text-sm">{c}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-display font-bold mb-3">Dados técnicos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metaInfo.map((m) => (
                <div key={m.label} className="p-4 rounded-xl bg-dark-100 dark:bg-dark-800/60 border dark:border-dark-800">
                  <Icon name={m.icon} size={16} className="text-primary-500 mb-1.5" />
                  <p className="text-xs text-dark-500 dark:text-dark-400 uppercase tracking-wide">{m.label}</p>
                  <p className="font-semibold text-sm mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="relative">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-dark-200 dark:ring-dark-700">
              <img src={poster} alt={title.title} onError={() => setPosterImg(posterPlaceholder(title.slug, title.title))} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <Carousel title="Você também pode gostar" items={similar} onMore={setModalTitle} />
        </div>
      )}

      <DetailModal open={!!modalTitle} title={modalTitle} onClose={() => setModalTitle(null)} onContentClick={(t) => setWatchTitle(t)} />
      <WatchModal open={!!watchTitle} title={watchTitle} onClose={() => setWatchTitle(null)} />
    </div>
  )
}