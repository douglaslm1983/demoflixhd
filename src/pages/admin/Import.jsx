import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Icon from '../../components/Icon'
import TmdbImporter from '../../components/admin/TmdbImporter'

export default function AdminImport() {
  const { settings } = useData()

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
          <Icon name="upload" size={26} className="text-primary-500" /> Importar do TMDB
        </h1>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
          Adicione conteúdo ao catálogo em massa ou manualmente usando o TMDB.
        </p>
      </header>

      {!settings.tmdbKey ? (
        <div className="card p-8 text-center max-w-lg mx-auto animate-slide-up">
          <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-primary-500/10 text-primary-500 mx-auto">
            <Icon name="info" size={26} />
          </span>
          <h2 className="mt-4 text-lg font-display font-bold">Chave da API TMDB não configurada</h2>
          <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
            Para importar conteúdo do TMDB, informe sua chave de API nas configurações do painel.
          </p>
          <Link
            to="/admin/configuracoes#tmdb"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <Icon name="settings" size={16} /> Configurar chave TMDB
          </Link>
        </div>
      ) : (
        <TmdbImporter apiKey={settings.tmdbKey} />
      )}
    </div>
  )
}