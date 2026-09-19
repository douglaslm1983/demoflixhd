import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import { avatarPlaceholder } from '../../utils/placeholder'

export default function Login() {
  const { login } = useAuth()
  const { settings } = useData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@demoflix.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Falha no login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-dark-950 text-white">
      {/* Painel visual */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-dark-950 to-dark-900" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Icon name="layout" size={14} /> Painel administrativo
          </span>
          <h1 className="text-4xl font-display font-extrabold leading-tight">
            Gerencie o {settings.siteName} com facilidade.
          </h1>
          <p className="mt-3 text-dark-300">
            Adicione, edite e remova filmes e séries, gerencie usuários e personalize as
            configurações do site em tempo real.
          </p>
        </div>
        <p className="relative text-sm text-dark-400">© {new Date().getFullYear()} {settings.siteName}</p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 bg-dark-50 dark:bg-dark-950 text-dark-900 dark:text-dark-50">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Logo />
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Alternar tema">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold">Entrar</h2>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            Acesse o painel administrativo de {settings.siteName}.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Senha</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input ${error ? 'input-error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 text-sm border border-red-500/30 animate-slide-down">
                <Icon name="info" size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Icon name="layout" size={16} /> Entrar no painel
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl border border-dashed border-dark-300 dark:border-dark-700 bg-dark-50 dark:bg-dark-900/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-2 flex items-center gap-1.5">
              <Icon name="eye" size={13} /> Contas de demonstração
            </p>
            <div className="space-y-2">
              {[
                { email: 'admin@demoflix.com', pass: 'admin123', role: 'Admin', color: 'bg-primary-500/15 text-primary-500' },
                { email: 'user@demoflix.com', pass: 'user123', role: 'Usuário', color: 'bg-blue-500/15 text-blue-500' },
              ].map((c) => (
                <div key={c.email} className="flex items-center justify-between gap-2 text-sm flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={avatarPlaceholder(c.email)} alt="" className="w-7 h-7 rounded-full hidden sm:block" />
                    <span className="truncate text-dark-600 dark:text-dark-300">{c.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.color}`}>{c.role}</span>
                  </div>
                  <code className="text-xs text-dark-400 select-all">{c.pass}</code>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
            <Link to="/" className="inline-flex items-center gap-1.5 hover:text-primary-500 font-medium">
              <Icon name="chevron-left" size={15} /> Voltar para o site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}