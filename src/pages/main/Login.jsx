import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const { settings } = useData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const logged = await login(identifier.trim(), password)
      navigate(logged.role === 'admin' ? '/admin' : '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Falha no login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-dark-950 text-white">
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-dark-950 to-dark-900" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Icon name="user" size={14} /> Sua conta
          </span>
          <h1 className="text-4xl font-display font-extrabold leading-tight">
            Entre no {settings.siteName} e curta seus favoritos.
          </h1>
          <p className="mt-3 text-dark-300">
            Salve filmes e séries na sua lista pessoal em qualquer dispositivo.
          </p>
        </div>
        <p className="relative text-sm text-dark-400">© {new Date().getFullYear()} {settings.siteName}</p>
      </div>

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
            Acesse sua conta para salvar sua lista pessoal.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium mb-1.5">Nome de usuário</label>
              <input
                id="identifier"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input"
                placeholder="Seu nome de usuário"
                autoComplete="username"
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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Icon name="log-in" size={16} /> Entrar
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
            Ainda não tem conta?{' '}
            <Link to="/criar-conta" className="inline-flex items-center gap-1 font-medium text-primary-500 hover:underline">
              <Icon name="user-plus" size={15} /> Criar conta grátis
            </Link>
          </p>

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