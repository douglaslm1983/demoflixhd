import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import Icon from '../../components/Icon'
import { tmdbRequest } from '../../utils/tmdb'

export default function AdminSettings() {
  const { settings, updateSettings, resetCatalog, clearCatalog, titles, movies, series } = useData()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState({
    siteName: settings.siteName,
    tagline: settings.tagline,
    maintenance: settings.maintenance,
  })
  const [saved, setSaved] = useState(false)
  const [tmdbKey, setTmdbKey] = useState(settings.tmdbKey || '')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState(null)
  const [keySaved, setKeySaved] = useState(false)

  const saveKey = async (e) => {
    e.preventDefault()
    const key = tmdbKey.trim()
    if (!key) {
      setTestMsg({ ok: false, text: 'Informe a chave antes de testar.' })
      return
    }
    setTesting(true)
    setTestMsg(null)
    try {
      await tmdbRequest(key, '/configuration')
      updateSettings({ tmdbKey: key })
      setTestMsg({ ok: true, text: 'Conexão com o TMDB OK! Chave salva.' })
      setKeySaved(true)
      setTimeout(() => setKeySaved(false), 2500)
    } catch (err) {
      setTestMsg({ ok: false, text: err.message || 'Falha ao conectar com o TMDB.' })
    } finally {
      setTesting(false)
    }
  }

  const save = (e) => {
    e.preventDefault()
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Configurações</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
          Personalize o site e gerencie o catálogo.
        </p>
      </header>

      <div className="max-w-3xl grid gap-6">
        {/* Aparência */}
        <section className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-1">
            <Icon name="sun" size={18} className="text-primary-500" /> Aparência
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">Escolha o tema do painel e do site.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'dark', label: 'Escuro', icon: 'moon' },
              { key: 'light', label: 'Claro', icon: 'sun' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  theme === t.key
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-200 dark:border-dark-700 hover:border-primary-400'
                }`}
              >
                <Icon name={t.icon} size={20} className={theme === t.key ? 'text-primary-500' : 'text-dark-400'} />
                <p className="mt-2 font-semibold text-sm">{t.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Site */}
        <section className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-1">
            <Icon name="settings" size={18} className="text-primary-500" /> Site
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            Informações exibidas no site público.
          </p>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome do site</label>
              <input
                className="input"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                placeholder="DemoFlix HD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slogan / descrição</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Filmes, séries e muito mais..."
              />
            </div>
            <label className="flex items-center gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/60 border border-dark-100 dark:border-dark-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.maintenance}
                onChange={(e) => setForm({ ...form, maintenance: e.target.checked })}
                className="w-5 h-5 accent-primary-500"
              />
              <span>
                <span className="block text-sm font-semibold">Modo manutenção</span>
                <span className="block text-xs text-dark-500 dark:text-dark-400">
                  Exibe um aviso temporário no rodapé do site público.
                </span>
              </span>
            </label>
            <div className="flex items-center gap-3 justify-end">
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500 font-medium animate-slide-down">
                  <Icon name="check" size={15} /> Salvo!
                </span>
              )}
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
                Salvar alterações
              </button>
            </div>
          </form>
        </section>

        {/* TMDB */}
        <section id="tmdb" className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-1">
            <Icon name="upload" size={18} className="text-primary-500" /> Integração TMDB
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            Adicione conteúdo ao catálogo em massa ou manualmente usando o TMDB.
          </p>
          <form onSubmit={saveKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Chave da API (v3 auth)</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input pr-11"
                  value={tmdbKey}
                  onChange={(e) => setTmdbKey(e.target.value)}
                  placeholder="Cole sua chave da API TMDB"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
                  aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
                >
                  <Icon name="eye" size={17} />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-dark-400">
                Obtenha gratuitamente em{' '}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  themoviedb.org/settings/api
                </a>
                .
              </p>
            </div>
            {testMsg && (
              <p className={`text-sm font-medium ${testMsg.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                {testMsg.text}
              </p>
            )}
            <div className="flex items-center gap-3 justify-end">
              {keySaved && (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500 font-medium animate-slide-down">
                  <Icon name="check" size={15} /> Chave salva!
                </span>
              )}
              <button
                type="submit"
                disabled={testing}
                className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Icon name="check" size={15} /> {testing ? 'Testando...' : 'Testar e salvar'}
              </button>
            </div>
          </form>

          {settings.tmdbKey && (
            <div className="mt-4 flex items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <p className="text-sm inline-flex items-center gap-2">
                <Icon name="check" size={16} /> Chave TMDB configurada.
              </p>
              <Link
                to="/admin/importar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors shrink-0"
              >
                <Icon name="upload" size={13} /> Importar conteúdo
              </Link>
            </div>
          )}
        </section>

        {/* Catálogo */}
        <section className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-1">
            <Icon name="film" size={18} className="text-primary-500" /> Catálogo
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            {titles.length} títulos no total: {movies.length} filmes e {series.length} séries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (window.confirm('Restaurar o catálogo original? Todas as adições e edições serão perdidas.')) {
                  resetCatalog()
                  window.location.href = '/admin'
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors"
            >
              <Icon name="trash" size={16} /> Restaurar catálogo padrão
            </button>
            <button
              onClick={() => {
                if (window.confirm('Excluir TODO o conteúdo? Todos os filmes e séries serão removidos permanentemente, incluindo a minha lista dos usuários. Esta ação não pode ser desfeita.')) {
                  clearCatalog()
                  window.location.href = '/admin'
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              <Icon name="trash" size={16} /> Excluir todo o conteúdo
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}