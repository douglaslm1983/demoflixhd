import { useEffect } from 'react'
import Icon from './Icon'

export default function DetailModal({ open, onClose, title, onContentClick }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !title) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white dark:bg-dark-900 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-dark-950/60 text-white hover:bg-primary-500 transition-colors"
          aria-label="Fechar"
        >
          <Icon name="x" size={18} />
        </button>

        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
            src={title.backdrop || title.poster}
            alt={title.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark-900 via-transparent to-dark-950/40" />
          <div className="absolute bottom-3 left-5 right-5">
            <h3 className="text-2xl md:text-3xl font-display font-bold">{title.title}</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 font-semibold text-yellow-500">
                <Icon name="star" size={13} /> {Number(title.rating || 0).toFixed(1)}
              </span>
              <span>•</span> {title.year} <span>•</span>
              {title.type === 'movie'
                ? `${Math.floor(title.duration / 60)}h ${title.duration % 60}min`
                : `${title.seasons} temporada${title.seasons > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {title.genres?.map((g) => (
              <span key={g} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                {g}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-dark-600 dark:text-dark-300 line-clamp-4">
            {title.synopsis}
          </p>
          {title.cast?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-dark-400 font-semibold mb-1.5">Elenco</p>
              <p className="text-sm text-dark-600 dark:text-dark-300 line-clamp-1">{title.cast.join(', ')}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onContentClick?.(title)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <Icon name="play" size={15} /> Assistir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-dark-300 dark:border-dark-700 text-sm font-medium hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}