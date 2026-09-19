import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useData } from '../context/DataContext'
import { posterPlaceholder } from '../utils/placeholder'

export default function PosterCard({ title, onMore, width = 'w-40 md:w-48' }) {
  const { toggleMyList, isInMyList } = useData()
  const navigate = useNavigate()
  const [img, setImg] = useState(title.poster || posterPlaceholder(title.slug, title.title))
  const inList = isInMyList(title.id)

  const detail = () => navigate(`/detalhes/${title.type}/${title.id}`)

  return (
    <div className={`${width} shrink-0 group snap-start`}>
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-900/80 shadow-lg ring-1 ring-dark-200 dark:ring-dark-700 group-hover:ring-primary-500/60 transition-all duration-300">
        <img
          src={img}
          alt={title.title}
          loading="lazy"
          onError={() => setImg((cur) => (cur.startsWith('data:') ? cur : posterPlaceholder(title.slug, title.title)))}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-2 left-2">
          <MetaChip title={title} />
        </div>

        <button
          onClick={() => toggleMyList(title.id)}
          className={`absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full backdrop-blur transition-all ${
            inList
              ? 'bg-primary-500 text-white'
              : 'bg-dark-950/60 text-white opacity-0 group-hover:opacity-100 hover:bg-primary-600'
          }`}
          title={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
        >
          <Icon name={inList ? 'check' : 'plus'} size={16} />
        </button>

        <div className="absolute bottom-14 inset-x-0 px-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <p className="text-sm font-semibold text-white line-clamp-2 drop-shadow">
            {title.originalTitle || title.title}
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={detail}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-dark-950 text-xs font-bold hover:bg-primary-500 hover:text-white transition-colors"
          >
            <Icon name="play" size={13} /> Assistir
          </button>
          <button
            onClick={() => onMore?.(title)}
            className="w-9 h-9 grid place-items-center rounded-lg bg-white/20 text-white backdrop-blur hover:bg-white/40 transition-colors"
            title="Mais informações"
          >
            <Icon name="info" size={16} />
          </button>
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold line-clamp-1">{title.title}</p>
        <p className="text-xs text-dark-500 dark:text-dark-400 flex items-center gap-1">
          <Icon name="star" size={11} className="text-yellow-400" />
          {Number(title.rating || 0).toFixed(1)}
          <span>•</span>
          {title.year}
          <span>•</span>
          {title.type === 'movie' ? title.duration : title.seasons ? `${title.seasons} temporadas` : 'Série'}
        </p>
      </div>
    </div>
  )
}

function MetaChip({ title }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-950/70 text-[11px] font-semibold text-white backdrop-blur">
      <Icon name={title.type === 'movie' ? 'film' : 'tv'} size={11} />
      {title.type === 'movie' ? 'Filme' : 'Série'}
    </span>
  )
}