import { useData } from '../../context/DataContext'
import AdminTitlesTable from '../../components/admin/AdminTitlesTable'

export default function AdminSeries() {
  const { series } = useData()

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Séries</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
          {series.length} série{series.length !== 1 && 's'} no catálogo. Adicione, edite e remova títulos.
        </p>
      </header>
      <AdminTitlesTable type="series" />
    </div>
  )
}