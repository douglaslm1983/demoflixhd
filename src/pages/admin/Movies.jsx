import { useData } from '../../context/DataContext'
import AdminTitlesTable from '../../components/admin/AdminTitlesTable'
import Icon from '../../components/Icon'

export default function AdminMovies() {
  const { movies, deleteMany } = useData()

  const deleteAll = () => {
    if (window.confirm(`Excluir TODOS os ${movies.length} filmes do catálogo? Esta ação não pode ser desfeita.`)) {
      deleteMany(movies.map((m) => m.id))
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Filmes</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
            {movies.length} filme{movies.length !== 1 && 's'} no catálogo. Adicione, edite e remova títulos.
          </p>
        </div>
        {movies.length > 0 && (
          <button
            onClick={deleteAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            <Icon name="trash" size={16} /> Excluir todos os filmes
          </button>
        )}
      </header>
      <AdminTitlesTable type="movie" />
    </div>
  )
}