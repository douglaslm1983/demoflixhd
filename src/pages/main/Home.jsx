import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Carousel from '../../components/Carousel'
import DetailModal from '../../components/DetailModal'
import WatchModal from '../../components/WatchModal'
import Icon from '../../components/Icon'
import { MetaBadge, RatingStars } from '../../components/Rating'
import { backdropPlaceholder } from '../../utils/placeholder'

function Hero({ titles }) {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const [prevTitlesId, setPrevTitlesId] = useState(titles.length ? titles[0].id : '')
  const [broken, setBroken] = useState(() => new Set())

  const currentId = titles.length ? titles[0].id : ''
  if (currentId !== prevTitlesId) {
    setPrevTitlesId(currentId)
    setIdx(0)
  }

  useEffect(() => {
    if (!titles.length) return
    const id = setInterval(() => setIdx((i) => (i + 1) % titles.length), 7000)
    return () => clearInterval(id)
  }, [titles.length])

  if (!titles.length) return null

  const t = titles[idx]
  const img = broken.has(t.id) || !t.backdrop
    ? backdropPlaceholder(t.slug, t.title)
    : t.backdrop

  return (
    <section className="relative h-[520px] md:h-[620px] lg:h-[72vh] min-h-[480px] overflow-hidden -mt-2">
      <div className="absolute inset-0">
        <img
          src={img}
          alt={t.title}
          onError={() => setBroken((prev) => new Set(prev).add(t.id))}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-dark-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-50 dark:from-dark-950 via-transparent to-dark-950/60" />
      </div>

      <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl animate-slide-up" key={t.id}>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-500 text-xs font-semibold uppercase tracking-wider">
              <Icon name="trend" size={14} /> Em destaque
            </span>
            <MetaBadge ageRating={t.ageRating} quality={t.quality} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl">
            {t.title}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-white/80 flex-wrap">
            <RatingStars value={t.rating} showValue size={16} />
            <span className="flex items-center gap-1"><Icon name="calendar" size={14} /> {t.year}</span>
            <span className="flex items-center gap-1">
              <Icon name={t.type === 'movie' ? 'clock' : 'tv'} size={14} />
              {t.type === 'movie'
                ? `${Math.floor(t.duration / 60)}h ${t.duration % 60}min`
                : `${t.seasons} temporada${t.seasons > 1 ? 's' : ''}`}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              {t.genres.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded bg-white/10 backdrop-blur text-xs">{g}</span>
              ))}
            </span>
          </div>
          <p className="mt-4 text-white/90 leading-relaxed line-clamp-3 max-w-xl">{t.synopsis}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/detalhes/${t.type}/${t.id}`)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-dark-950 font-bold hover:bg-primary-500 hover:text-white transition-all active:scale-95 shadow-2xl"
            >
              <Icon name="play" size={18} /> Assistir agora
            </button>
            <button
              onClick={() => navigate(`/detalhes/${t.type}/${t.id}`)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 text-white backdrop-blur font-semibold hover:bg-white/20 transition-all active:scale-95"
            >
              <Icon name="info" size={18} /> Mais detalhes
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-1.5">
        {titles.map((_, i) => (
          <span key={i} className="relative">
            <span
              className={`w-8 h-1.5 rounded-full transition-all cursor-pointer ${
                i === idx ? 'bg-primary-500' : 'bg-white/30 hover:bg-white/60'
              }`}
              style={{ width: i === idx ? 24 : 12 }}
            />
            <span className="absolute inset-0" onClick={() => setIdx(i)} style={{ cursor: 'pointer' }} />
          </span>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const { featured, movies, series, titles, myListTitles } = useData()
  const [modalTitle, setModalTitle] = useState(null)
  const [watchTitle, setWatchTitle] = useState(null)

  const topMovies = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 12)
  const topSeries = [...series].sort((a, b) => b.rating - a.rating).slice(0, 12)
  const recent = [...titles]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 12)
  const trending = [...titles].sort((a, b) => b.rating - a.rating).slice(0, 14)

  return (
    <div>
      <Hero titles={featured.length ? featured : topMovies.slice(0, 4)} />

      <div className="space-y-12 py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {myListTitles.length > 0 && (
          <Carousel
            title="Minha lista"
            subtitle={`${myListTitles.length} título${myListTitles.length > 1 ? 's' : ''} salvos`}
            link="/minha-lista"
            items={myListTitles}
            onMore={setModalTitle}
          />
        )}

        <Carousel
          title="Tendências da semana"
          subtitle="Os mais bem avaliados do catálogo"
          items={trending}
          onMore={setModalTitle}
        />

        <Carousel
          title="Filmes em alta"
          subtitle="Os melhores filmes escolhidos a dedo"
          link="/filmes"
          items={topMovies}
          onMore={setModalTitle}
        />

        <Carousel
          title="Séries do momento"
          subtitle="Maratonas imperdíveis"
          link="/series"
          items={topSeries}
          onMore={setModalTitle}
        />

        <Carousel
          title="Recém-adicionados"
          subtitle="Novidades fresquinhas no acervo"
          link="/busca"
          items={recent}
          onMore={setModalTitle}
        />
      </div>

      <DetailModal open={!!modalTitle} title={modalTitle} onClose={() => setModalTitle(null)} onContentClick={(t) => setWatchTitle(t)} />
      <WatchModal open={!!watchTitle} title={watchTitle} onClose={() => setWatchTitle(null)} />
    </div>
  )
}