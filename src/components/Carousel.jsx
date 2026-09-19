import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import PosterCard from './PosterCard'

export default function Carousel({ title, subtitle, link, linkLabel = 'Ver todos', items, onMore }) {
  const ref = useRef(null)

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.85), behavior: 'smooth' })
  }

  if (!items || items.length === 0) return null

  return (
    <section className="relative">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-dark-500 dark:text-dark-400">{subtitle}</p>}
        </div>
        {link && (
          <Link
            to={link}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 shrink-0"
          >
            {linkLabel} <Icon name="chevron-right" size={14} />
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4"
        >
          {items.map((t) => (
            <PosterCard key={t.id} title={t} onMore={onMore} />
          ))}
        </div>
        {['left', 'right'].map((dir) => (
          <button
            key={dir}
            onClick={() => scroll(dir === 'left' ? -1 : 1)}
            className="absolute top-1/2 -translate-y-1/2 hidden md:grid place-items-center w-10 h-10 rounded-full bg-dark-950/80 text-white backdrop-blur border border-white/10 hover:bg-primary-500 transition-colors shadow-xl"
            style={{ [dir]: '-8px' }}
            aria-label={`Rolar para ${dir}`}
          >
            <Icon name={dir === 'left' ? 'chevron-left' : 'chevron-right'} size={20} />
          </button>
        ))}
      </div>
    </section>
  )
}