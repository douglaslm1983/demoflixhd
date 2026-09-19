import { useData } from '../../context/DataContext'
import AdminTitlesTable from '../../components/admin/AdminTitlesTable'
import Icon from '../../components/Icon'

export default function AdminSeries() {
  const { series, deleteMany } = useData()

  const deleteAll = () => {
    if (window.confirm(`Excluir TODAS as ${series.length} séries do catálogo? Esta ação não pode ser desfeita.`)) {
      deleteMany(series.map((s) => s.id))
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Séries</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
            {series.length} série{series.length !== 1 && 's'} no catálogo. Adicione, edite e remova títulos.
          </p>
        </div>
        {series.length > 0 && (
          <button
            onClick={deleteAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            <Icon name="trash" size={16} /> Excluir todas as séries
          </button>
        )}
      </header>
      <AdminTitlesTable type="series" />
    </div>
  )
}