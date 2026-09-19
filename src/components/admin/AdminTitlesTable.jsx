import { useMemo, useState } from 'react'
import Icon from '../Icon'
import { useData } from '../../context/DataContext'
import { posterPlaceholder } from '../../utils/placeholder'
import TitleFormModal from './TitleFormModal'

export default function AdminTitlesTable({ type }) {
  const { titles, updateTitle, deleteTitle, deleteMany } = useData()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selected, setSelected] = useState([])
  const [openForm, setOpenForm] = useState(false)
  const [toast, setToast] = useState('')

  const items = useMemo(() => {
    const term = q.trim().toLowerCase()
    let out = titles.filter((t) => t.type === type)
    if (term) {
      out = out.filter((t) =>
        [t.title, t.originalTitle, t.slug, ...t.genres, ...(t.cast || [])].join(' ').toLowerCase().includes(term),
      )
    }
    return [...out].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
  }, [titles, type, q])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteTitle(deleting.id)
    notify(`"${deleting.title}" removido com sucesso.`)
    setDeleting(null)
  }

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selected.length === items.length && items.length > 0) {
      setSelected([])
    } else {
      setSelected(items.map((t) => t.id))
    }
  }

  const confirmBulk = () => {
    if (!bulkDeleting) return
    const count = bulkDeleting.length
    deleteMany(bulkDeleting)
    setSelected((prev) => prev.filter((id) => !bulkDeleting.includes(id)))
    notify(`${count} ${type === 'movie' ? 'filme' : 'série'}${count !== 1 ? 's' : ''} removido${count !== 1 ? 's' : ''}.`)
    setBulkDeleting(false)
  }

  const allSelected = items.length > 0 && items.every((t) => selected.includes(t.id))

  return (
    <div>
      {/* Barra de ações */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon name="search" size={16} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Buscar ${type === 'movie' ? 'filme' : 'série'}...`}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <span className="hidden sm:block text-xs text-dark-500 dark:text-dark-400 font-medium">
                {selected.length} selecionado{selected.length !== 1 && 's'}
              </span>
              <button
                onClick={() => setBulkDeleting([...selected])}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Icon name="trash" size={15} /> Excluir selecionados
              </button>
            </>
          )}
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border border-dark-300 dark:border-dark-700 hover:border-primary-500 hover:text-primary-500 transition-colors"
              title="Limpar seleção"
            >
              <Icon name="x" size={14} />
            </button>
          )}
          <button
            onClick={() => { setOpenForm(true); setEditing(null) }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <Icon name="plus" size={16} /> Adicionar {type === 'movie' ? 'filme' : 'série'}
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-dark-50 dark:bg-dark-800/50 text-dark-500 dark:text-dark-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-primary-500"
                    aria-label="Selecionar todos"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Gêneros</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Ano</th>
                <th className="px-4 py-3 font-semibold">Nota</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Qualidade</th>
                <th className="px-4 py-3 font-semibold">Destaque</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {items.map((t) => (
                <tr key={t.id} className={`transition-colors ${selected.includes(t.id) ? 'bg-primary-500/5' : 'hover:bg-dark-50 dark:hover:bg-dark-800/50'}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="w-4 h-4 accent-primary-500"
                      aria-label={`Selecionar ${t.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={t.poster || posterPlaceholder(t.slug, t.title)} alt={t.title} className="w-9 h-13 h-[52px] rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-[220px]">{t.title}</p>
                        <p className="text-xs text-dark-400">
                          {t.type === 'movie' ? `${t.duration} min` : `${t.seasons} temp • ${t.episodes} eps`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {t.genres.slice(0, 3).map((g) => (
                        <span key={g} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                          {g}
                        </span>
                      ))}
                      {t.genres.length > 3 && <span className="text-[10px] text-dark-400 self-center">+{t.genres.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{t.year}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-yellow-500">
                      <Icon name="star" size={13} /> {Number(t.rating || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300">
                      {t.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        updateTitle(t.id, { featured: !t.featured })
                        notify(t.featured ? `"${t.title}" removido dos destaques.` : `"${t.title}" adicionado aos destaques.`)
                      }}
                      className={`inline-grid place-items-center w-9 h-9 rounded-lg transition-all ${
                        t.featured
                          ? 'bg-yellow-500/15 text-yellow-500'
                          : 'bg-dark-100 dark:bg-dark-800 text-dark-400 hover:text-yellow-500 hover:bg-yellow-500/10'
                      }`}
                      title={t.featured ? 'Remover do destaque' : 'Adicionar ao destaque'}
                    >
                      <Icon name="trend" size={16} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setOpenForm(true); setEditing(t) }}
                        className="p-2 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                        title="Editar"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        onClick={() => setDeleting(t)}
                        className="p-2 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Excluir"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="p-10 text-center">
            <Icon name={type === 'movie' ? 'film' : 'tv'} size={40} className="mx-auto text-dark-300 dark:text-dark-600" />
            <p className="mt-3 font-semibold">Nenhum resultado</p>
            <p className="text-sm text-dark-400">Ajuste a busca ou adicione um novo título.</p>
          </div>
        )}
      </div>

      {/* Modal form */}
      {openForm && (
        <TitleFormModal
          type={type}
          initial={editing}
          onClose={() => { setOpenForm(false); setEditing(null) }}
          onSaved={() => {
            setOpenForm(false)
            setEditing(null)
            notify(editing ? 'Alterações salvas com sucesso!' : 'Título criado com sucesso!')
          }}
        />
      )}

      {/* Modal excluir */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setDeleting(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-900 p-6 text-center animate-scale-in shadow-2xl">
            <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-red-500/10 text-red-500 mx-auto">
              <Icon name="trash" size={26} />
            </span>
            <h3 className="mt-4 text-lg font-display font-bold">Excluir {type === 'movie' ? 'filme' : 'série'}?</h3>
            <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
              <strong className="text-dark-900 dark:text-dark-100">"{deleting.title}"</strong> será removido permanentemente
              do catálogo e da minha lista dos usuários. Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setDeleting(null)} className="px-4 py-2.5 rounded-xl border border-dark-300 dark:border-dark-700 font-medium hover:border-primary-500 hover:text-primary-500 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal excluir em massa */}
      {bulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setBulkDeleting(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-900 p-6 text-center animate-scale-in shadow-2xl">
            <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-red-500/10 text-red-500 mx-auto">
              <Icon name="trash" size={26} />
            </span>
            <h3 className="mt-4 text-lg font-display font-bold">Excluir {bulkDeleting.length} {type === 'movie' ? 'filme' : 'série'}{bulkDeleting.length !== 1 && 's'}?</h3>
            <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
              Os títulos selecionados serão removidos permanentemente do catálogo e da minha lista dos usuários. Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setBulkDeleting(false)} className="px-4 py-2.5 rounded-xl border border-dark-300 dark:border-dark-700 font-medium hover:border-primary-500 hover:text-primary-500 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmBulk} className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                Excluir tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-medium shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  )
}