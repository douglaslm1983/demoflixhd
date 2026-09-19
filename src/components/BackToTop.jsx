import { useEffect, useState } from 'react'
import Icon from './Icon'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 grid place-items-center rounded-full bg-primary-500 text-white shadow-2xl shadow-primary-500/40 hover:bg-primary-600 active:scale-95 transition-all animate-scale-in"
      title="Voltar ao topo"
      aria-label="Voltar ao topo"
    >
      <Icon name="chevron-up" size={20} />
    </button>
  )
}