import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Icon from './Icon'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { avatarPlaceholder } from '../utils/placeholder'

const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/filmes', label: 'Filmes' },
  { to: '/series', label: 'Séries' },
  { to: '/minha-lista', label: 'Minha lista' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { myList, settings } = useData()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const submit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              <Icon name={open ? 'x' : 'menu'} />
            </button>
            <Link to="/">
              <Logo />
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-500 bg-primary-500/10'
                        : 'text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={submit} className="hidden md:flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
                  <Icon name="search" size={16} />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar filmes e séries..."
                  className="w-56 lg:w-72 pl-9 pr-3 py-2 text-sm rounded-full bg-dark-100 dark:bg-dark-800 border border-transparent dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Alternar tema"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
            </button>

            {isAuthenticated ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                title="Painel administrativo"
              >
                <img
                  src={user?.avatar || avatarPlaceholder(user?.name || 'Usuário')}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/60"
                />
                {user?.role === 'admin' && (
                  <span className="hidden sm:inline text-xs font-medium text-dark-500 dark:text-dark-400">
                    Admin
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-500 border border-primary-500/40 hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Icon name="layout" size={16} />
                Administração
              </Link>
            )}

            <Link
              to="/minha-lista"
              className="relative p-2.5 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Minha lista"
            >
              <Icon name="list" size={20} />
              {myList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 grid place-items-center text-[10px] font-bold text-white bg-primary-500 rounded-full">
                  {myList.length}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2.5 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label="Buscar"
            >
              <Icon name="search" size={20} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass border-t-0 px-4 pb-4 pt-2">
          <form onSubmit={submit} className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              <Icon name="search" size={16} />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filmes e séries..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-dark-100 dark:bg-dark-800 border border-transparent dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <p className="mt-3 px-4 text-xs text-dark-500 dark:text-dark-400">{settings.tagline}</p>
        </div>
      )}
    </header>
  )
}