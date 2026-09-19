import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import StreamPlayer from './StreamPlayer'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

export default function WatchModal({ open, onClose, title }) {
  const navigate = useNavigate()
  const [state, setState] = useState('idle')
  const [prevOpen, setPrevOpen] = useState(open)
  const { toggleMyList, isInMyList } = useData()
  const { isAuthenticated } = useAuth()

  const toggle = () => {
    if (!isAuthenticated) return navigate('/admin/login')
    toggleMyList(title.id)
  }

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setState('playing')
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open || !title) return null

  const hasStream = !!title.streamUrl

  const goDetail = () => {
    onClose?.()
    navigate(`/detalhes/${title.type}/${title.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-dark-950/90 backdrop-blur"
        onClick={() => {
          setState('idle')
          onClose?.()
        }}
      />
      <div className="relative w-full max-w-4xl animate-scale-in">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-dark-900">
          {hasStream ? (
            <StreamPlayer title={title} autoFocus />
          ) : (
            <>
              <img
                src={title.backdrop || title.poster}
                alt={title.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-dark-950/30" />

              <div className="relative aspect-video flex flex-col items-center justify-center gap-4 p-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">
                  Reprodução de demonstração
                </span>

                <button
                  onClick={() => setState((s) => (s === 'playing' ? 'paused' : 'playing'))}
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-full grid place-items-center transition-transform hover:scale-105 ${
                    state === 'playing'
                      ? 'bg-primary-500 text-white shadow-2xl shadow-primary-500/40'
                      : 'bg-white text-dark-950 shadow-2xl'
                  }`}
                  aria-label={state === 'playing' ? 'Pausar' : 'Reproduzir'}
                >
                  <Icon name={state === 'playing' ? 'play' : 'pause'} size={40} />
                </button>

                {state === 'playing' ? (
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500" />
                    </span>
                    Reproduzindo... este é um player demonstrativo.
                  </p>
                ) : (
                  <p className="text-dark-900 dark:text-dark-950 text-sm font-medium">Pausado</p>
                )}

                <h3 className="text-2xl md:text-4xl font-display font-bold text-center drop-shadow-lg">
                  {title.title}
                </h3>
              </div>
            </>
          )}

          <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-dark-900">
            <div className="min-w-0">
              <h3 className="font-display font-bold truncate">{title.title}</h3>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                {title.type === 'movie' ? 'Filme' : 'Série'} • {title.year}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goDetail}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-100 dark:bg-dark-800 text-sm font-medium hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
              >
                <Icon name="info" size={15} /> Ver detalhes
              </button>
              <button
                onClick={toggle}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isInMyList(title.id)
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700'
                }`}
              >
                <Icon name={isInMyList(title.id) ? 'check' : 'plus'} size={15} />
                {isInMyList(title.id) ? 'Na minha lista' : 'Minha lista'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setState('idle')
            onClose?.()
          }}
          className="absolute -top-3 -right-3 w-10 h-10 grid place-items-center rounded-full bg-white text-dark-950 shadow-xl hover:bg-primary-500 hover:text-white transition-colors"
          aria-label="Fechar reprodutor"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
    </div>
  )
}