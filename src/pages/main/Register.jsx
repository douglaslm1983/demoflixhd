import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import Icon from '../../components/Icon'
import Logo from '../../components/Logo'
import { avatarPlaceholder } from '../../utils/placeholder'
import { readImageFile } from '../../utils/image'

export default function Register() {
  const { addUser, login } = useAuth()
  const { settings } = useData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', avatar: null })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatar = async (file) => {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 4MB.')
      return
    }
    try {
      const dataUrl = await readImageFile(file)
      setForm((f) => ({ ...f, avatar: dataUrl }))
      setError('')
    } catch {
      setError('Não foi possível carregar a imagem.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username.trim()) {
      setError('Defina um nome de usuário.')
      return
    }
    if (!form.name.trim()) {
      setError('Preencha seu nome.')
      return
    }
    if (!form.password.trim()) {
      setError('Defina uma senha.')
      return
    }
    setLoading(true)
    try {
      await addUser({
        username: form.username,
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'user',
        avatar: form.avatar,
      })
      await login(form.username.trim(), form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Não foi possível criar a conta.')
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
            <Icon name="user-plus" size={14} /> Cadastro grátis
          </span>
          <h1 className="text-4xl font-display font-extrabold leading-tight">
            Crie sua conta no {settings.siteName}.
          </h1>
          <p className="mt-3 text-dark-300">
            Escolha um nome de usuário e comece a montar sua lista de favoritos.
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

          <h2 className="text-2xl md:text-3xl font-display font-bold">Criar conta</h2>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            Leva menos de um minuto.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome de usuário</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input"
                placeholder="Ex.: maria.silva"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome completo</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Ex.: Maria Silva"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">E-mail <span className="text-dark-400 font-normal">(opcional)</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="exemplo@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Senha</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Foto do perfil <span className="text-dark-400 font-normal">(opcional)</span></label>
              <div className="flex items-center gap-4">
                <img
                  src={form.avatar || avatarPlaceholder(form.username || form.name || 'Novo usuário')}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-dark-200 dark:ring-dark-700"
                />
                <div className="space-y-1">
                  {form.avatar && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, avatar: null })}
                      className="block text-xs text-red-500 hover:underline"
                    >
                      Remover imagem
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-100 dark:bg-dark-800 text-xs font-semibold hover:bg-primary-500/15 hover:text-primary-500 transition-colors"
                  >
                    <Icon name="upload" size={13} /> Carregar foto
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatar(e.target.files?.[0])}
                  />
                </div>
              </div>
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
                  Criando conta...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Icon name="user-plus" size={16} /> Criar minha conta
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
            Já tem conta?{' '}
            <Link to="/entrar" className="inline-flex items-center gap-1 font-medium text-primary-500 hover:underline">
              <Icon name="log-in" size={15} /> Fazer login
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