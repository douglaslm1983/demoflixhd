import { useData } from '../../context/DataContext'
import AdminTitlesTable from '../../components/admin/AdminTitlesTable'

export default function AdminMovies() {
  const { movies } = useData()

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Filmes</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
          {movies.length} filme{movies.length !== 1 && 's'} no catálogo. Adicione, edite e remova títulos.
        </p>
      </header>
      <AdminTitlesTable type="movie" />
    </div>
  )
}