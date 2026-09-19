import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import Icon from '../../components/Icon'

export default function AdminSettings() {
  const { settings, updateSettings, resetCatalog, titles, movies, series } = useData()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState({
    siteName: settings.siteName,
    tagline: settings.tagline,
    maintenance: settings.maintenance,
  })
  const [saved, setSaved] = useState(false)

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

        {/* Catálogo */}
        <section className="card p-6 animate-slide-up">
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-1">
            <Icon name="film" size={18} className="text-primary-500" /> Catálogo
          </h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            {titles.length} títulos no total: {movies.length} filmes e {series.length} séries.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Restaurar o catálogo original? Todas as adições e edições serão perdidas.')) {
                resetCatalog()
                window.location.href = '/admin'
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors"
          >
            <Icon name="trash" size={16} /> Restaurar catálogo padrão
          </button>
        </section>
      </div>
    </div>
  )
}