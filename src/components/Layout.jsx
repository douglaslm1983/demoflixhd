import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Icon from './Icon'
import { useData } from '../context/DataContext'

export default function Layout() {
  const { pathname } = useLocation()
  const { titles } = useData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-dark-50 dark:bg-dark-950 text-dark-900 dark:text-dark-50">
      <Navbar />
      <main className="flex-1 pt-16">
        {titles.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-24 min-h-[60vh] animate-fade-in">
            <span className="inline-grid place-items-center w-20 h-20 rounded-full bg-primary-500/10 text-primary-500">
              <Icon name="settings" size={38} />
            </span>
            <h1 className="mt-6 text-3xl md:text-4xl font-display font-extrabold">Site em manutenção</h1>
            <p className="mt-3 text-dark-500 dark:text-dark-400 max-w-md">
              Não há conteúdo disponível no momento. Volte em breve — filmes e séries chegarão em breve!
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  )
}