import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'
import { posterPlaceholder } from '../../utils/placeholder'
import TitleFormModal from '../../components/admin/TitleFormModal'

export default function Dashboard() {
  const { titles, movies, series, featured, myList, resetCatalog, myListTitles } = useData()
  const { users } = useAuth()
  const [openForm, setOpenForm] = useState(false)
  const [formType, setFormType] = useState('movie')
  const [toast, setToast] = useState('')

  const stats = [
    { label: 'Títulos no acervo', value: titles.length, icon: 'film', color: 'text-primary-500 bg-primary-500/10' },
    { label: 'Filmes', value: movies.length, icon: 'film', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Séries', value: series.length, icon: 'tv', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Em destaque', value: featured.length, icon: 'trend', color: 'text-yellow-500 bg-yellow-500/10' },
    { label: 'Usuários', value: users.length, icon: 'users', color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Na minha lista', value: myList.length, icon: 'list', color: 'text-rose-500 bg-rose-500/10' },
  ]

  const recent = [...titles].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 6)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
          Visão geral do catálogo e ações rápidas.
        </p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 animate-slide-up">
            <span className={`inline-grid place-items-center w-10 h-10 rounded-xl ${s.color}`}>
              <Icon name={s.icon} size={20} />
            </span>
            <p className="mt-3 text-2xl font-display font-extrabold">{s.value}</p>
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recém adicionados */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold">Recém adicionados</h2>
            <Link to="/admin/filmes" className="text-sm text-primary-500 hover:underline">Ver todos</Link>
          </div>
          <div className="card overflow-hidden">
            <ul className="divide-y divide-dark-100 dark:divide-dark-800">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-3 p-3 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                  <img
                    src={t.poster || posterPlaceholder(t.slug, t.title)}
                    alt={t.title}
                    className="w-11 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t.title}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">
                      {t.year} • {t.type === 'movie' ? `${t.duration} min` : `${t.seasons} temporada${t.seasons > 1 ? 's' : ''}`} • {t.genres.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    t.type === 'movie' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    <Icon name={t.type === 'movie' ? 'film' : 'tv'} size={11} />
                    {t.type === 'movie' ? 'Filme' : 'Série'}
                  </span>
                  {t.featured && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[11px] font-bold uppercase">
                      <Icon name="trend" size={11} /> Destaque
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ações rápidas */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4">Ações rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => { setFormType('movie'); setOpenForm(true) }}
              className="w-full card p-4 flex items-center gap-3 hover:border-primary-500/50 hover:shadow-lg transition-all text-left"
            >
              <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500"><Icon name="plus" size={20} /></span>
              <span>
                <span className="block font-semibold text-sm">Adicionar filme</span>
                <span className="block text-xs text-dark-500 dark:text-dark-400">Novo título no catálogo</span>
              </span>
            </button>
            <button
              onClick={() => { setFormType('series'); setOpenForm(true) }}
              className="w-full card p-4 flex items-center gap-3 hover:border-primary-500/50 hover:shadow-lg transition-all text-left"
            >
              <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500"><Icon name="tv" size={20} /></span>
              <span>
                <span className="block font-semibold text-sm">Adicionar série</span>
                <span className="block text-xs text-dark-500 dark:text-dark-400">Nova série no catálogo</span>
              </span>
            </button>
            <Link to="/admin/usuarios" className="w-full card p-4 flex items-center gap-3 hover:border-primary-500/50 hover:shadow-lg transition-all">
              <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500"><Icon name="users" size={20} /></span>
              <span>
                <span className="block font-semibold text-sm">Gerenciar usuários</span>
                <span className="block text-xs text-dark-500 dark:text-dark-400">{users.length} cadastrados</span>
              </span>
            </Link>
            <Link to="/admin/configuracoes" className="w-full card p-4 flex items-center gap-3 hover:border-primary-500/50 hover:shadow-lg transition-all">
              <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500"><Icon name="settings" size={20} /></span>
              <span>
                <span className="block font-semibold text-sm">Configurações</span>
                <span className="block text-xs text-dark-500 dark:text-dark-400">Site, tema e catálogo</span>
              </span>
            </Link>

            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-2">Manutenção</p>
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">{myListTitles.length} títulos na minha lista de usuários do site.</p>
              <button
                onClick={() => {
                  if (window.confirm('Restaurar o catálogo para os dados originais? Esta ação remove todas as alterações e adições.')) {
                    resetCatalog()
                    notify('Catálogo restaurado com sucesso!')
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Icon name="trash" size={14} /> Restaurar catálogo padrão
              </button>
            </div>
          </div>
        </div>
      </div>

      {openForm && <TitleFormModal type={formType} onClose={() => setOpenForm(false)} onSaved={() => { setOpenForm(false); notify('Título criado com sucesso!') }} />}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-medium shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  )
}