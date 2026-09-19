import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { avatarPlaceholder } from '../utils/placeholder'
import Logo from './Logo'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'layout', end: true },
  { to: '/admin/filmes', label: 'Filmes', icon: 'film' },
  { to: '/admin/series', label: 'Séries', icon: 'tv' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'users' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: 'settings' },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center border-b border-dark-800">
        <Link to="/admin" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white'
              }`
            }
          >
            <Icon name={n.icon} size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-dark-800 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dark-300 hover:bg-dark-800 hover:text-white transition-all"
          onClick={() => setOpen(false)}
        >
          <Icon name="home" size={18} />
          Ver o site
        </Link>
        <div className="rounded-xl bg-dark-800/80 p-3">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || avatarPlaceholder(user?.name || 'Admin')} alt={user?.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/60" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-dark-700/50 text-dark-200 text-xs font-semibold hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <Icon name="logout" size={14} /> Sair
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-100 dark:bg-dark-950">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-dark-900 text-dark-100 z-40 border-r border-dark-800">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-dark-900 text-dark-100 shadow-2xl animate-slide-in-left">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 glass lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Abrir menu">
            <Icon name="menu" />
          </button>
          <Link to="/admin">
            <Logo compact />
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Alternar tema">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}