import { useMemo, useState } from 'react'
import Icon from '../Icon'
import { useData } from '../../context/DataContext'
import { GENRES, AGE_RATINGS, QUALITIES } from '../../data/catalog'
import { posterPlaceholder, backdropPlaceholder, stringHash } from '../../utils/placeholder'

const INITIAL = {
  type: 'movie',
  title: '',
  originalTitle: '',
  year: new Date().getFullYear(),
  genres: [],
  rating: 5,
  duration: 120,
  seasons: 1,
  episodes: 8,
  synopsis: '',
  cast: '',
  quality: 'HD',
  ageRating: '12',
  featured: false,
  poster: '',
  backdrop: '',
  streamUrl: '',
}

const inputCls =
  'input'
const labelCls = 'block text-sm font-medium mb-1.5'
const selectCls =
  'input'

export default function TitleFormModal({ type = 'movie', initial, onClose, onSaved }) {
  const { addTitle, updateTitle } = useData()
  const [form, setForm] = useState(() => {
    if (!initial) return { ...INITIAL, type }
    return {
      ...INITIAL,
      type: initial.type || type,
      title: initial.title || '',
      originalTitle: initial.originalTitle || '',
      year: initial.year || new Date().getFullYear(),
      genres: initial.genres || [],
      rating: initial.rating || 5,
      duration: initial.duration || 120,
      seasons: initial.seasons || 1,
      episodes: initial.episodes || 8,
      synopsis: initial.synopsis || '',
      cast: (initial.cast || []).join(', '),
      quality: initial.quality || 'HD',
      ageRating: initial.ageRating || '12',
      featured: !!initial.featured,
      poster: initial.poster || '',
      backdrop: initial.backdrop || '',
      streamUrl: initial.streamUrl || '',
    }
  })
  const [error, setError] = useState('')

  const isEdit = !!initial
  const seed = useMemo(() => (initial?.slug || form.title || 'novo'), [initial, form.title])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleGenre = (g) => {
    set({ genres: form.genres.includes(g) ? form.genres.filter((x) => x !== g) : [...form.genres, g] })
  }

  const autoPoster = () => {
    const h = stringHash(seed)
    const variant = (h % 3) + 1
    set({ poster: posterPlaceholder(`${seed}-p${variant}`, form.title || 'Novo título'), backdrop: backdropPlaceholder(`${seed}-b${variant}`, form.title || 'Novo título') })
  }

  const save = () => {
    if (!form.title.trim()) {
      setError('Informe o título.')
      return
    }
    if (form.genres.length === 0) {
      setError('Selecione ao menos um gênero.')
      return
    }
    const payload = {
      ...form,
      title: form.title.trim(),
      originalTitle: form.originalTitle.trim() || form.title.trim(),
      genres: form.genres,
      cast: form.cast.split(',').map((c) => c.trim()).filter(Boolean),
      rating: Number(form.rating) || 0,
      year: Number(form.year) || new Date().getFullYear(),
      duration: Number(form.duration) || 0,
      seasons: Number(form.seasons) || 1,
      episodes: Number(form.episodes) || 1,
      slug: form.title.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    }
    if (isEdit) {
      updateTitle(initial.id, payload)
    } else {
      addTitle(payload)
    }
    onSaved?.()
  }

  const fieldGroup = (label, control, full = false) => (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className={labelCls}>{label}</label>
      {control}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-dark-900 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b border-dark-100 dark:border-dark-800 bg-white dark:bg-dark-900">
          <div>
            <h3 className="text-lg font-display font-bold">
              {isEdit ? `Editar: ${initial.title}` : `Adicionar ${form.type === 'movie' ? 'filme' : 'série'}`}
            </h3>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              Preencha as informações abaixo. Campo "poster" e "backdrop" aceitam URLs.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-3">
            {['movie', 'series'].map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => set({ type: tp })}
                className={`p-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  form.type === tp
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                    : 'border-dark-200 dark:border-dark-700 text-dark-500 dark:text-dark-400 hover:border-primary-400'
                }`}
              >
                <Icon name={tp === 'movie' ? 'film' : 'tv'} size={16} />
                {tp === 'movie' ? 'Filme' : 'Série'}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {fieldGroup('Título *', (
              <input className={inputCls} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex.: O Poderoso Chefão" />
            ))}
            {fieldGroup('Título original', (
              <input className={inputCls} value={form.originalTitle} onChange={(e) => set({ originalTitle: e.target.value })} placeholder="Ex.: The Godfather" />
            ))}
            {fieldGroup('Ano', (
              <input type="number" className={inputCls} value={form.year} onChange={(e) => set({ year: e.target.value })} />
            ))}
            {fieldGroup('Avaliação (0-10)', (
              <input type="number" min="0" max="10" step="0.1" className={inputCls} value={form.rating} onChange={(e) => set({ rating: e.target.value })} />
            ))}

            {form.type === 'movie' ? (
              fieldGroup('Duração (min)', (
                <input type="number" className={inputCls} value={form.duration} onChange={(e) => set({ duration: e.target.value })} placeholder="Ex.: 120" />
              ))
            ) : (
              <>
                {fieldGroup('Temporadas', (
                  <input type="number" className={inputCls} value={form.seasons} onChange={(e) => set({ seasons: e.target.value })} />
                ))}
                {fieldGroup('Episódios', (
                  <input type="number" className={inputCls} value={form.episodes} onChange={(e) => set({ episodes: e.target.value })} />
                ))}
              </>
            )}

            {fieldGroup('Classificação', (
              <select className={selectCls} value={form.ageRating} onChange={(e) => set({ ageRating: e.target.value })}>
                {AGE_RATINGS.map((r) => <option key={r} value={r}>{r === 'L' ? 'Livre' : `${r} anos`}</option>)}
              </select>
            ))}
            {fieldGroup('Qualidade', (
              <select className={selectCls} value={form.quality} onChange={(e) => set({ quality: e.target.value })}>
                {QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            ))}

            {/* Gêneros */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Gêneros *</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const active = form.genres.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        active
                          ? 'bg-primary-500 text-white shadow'
                          : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                      }`}
                    >
                      {active && <Icon name="check" size={11} className="inline mr-1 -mt-0.5" />}
                      {g}
                    </button>
                  )
                })}
              </div>
            </div>

            {fieldGroup('Sinopse', (
              <textarea
                className={`${inputCls} min-h-[110px] resize-y`}
                value={form.synopsis}
                onChange={(e) => set({ synopsis: e.target.value })}
                placeholder="Descreva o enredo..."
              />
            ), true)}

            {fieldGroup('Elenco (separado por vírgula)', (
              <input className={inputCls} value={form.cast} onChange={(e) => set({ cast: e.target.value })} placeholder="Ex.: Al Pacino, Marlon Brando" />
            ), true)}

            {fieldGroup('URL de reprodução', (
              <div>
                <input className={inputCls} value={form.streamUrl} onChange={(e) => set({ streamUrl: e.target.value })} placeholder="Ex.: https://www.youtube.com/embed/xxxx ou {season}/{episode}" />
                <p className="mt-1.5 text-xs text-dark-400">
                  Link do vídeo/trailer. Para séries use as marcas <code className="px-1 py-0.5 rounded bg-dark-100 dark:bg-dark-800">{'{season}'}</code> e <code className="px-1 py-0.5 rounded bg-dark-100 dark:bg-dark-800">{'{episode}'}</code> na URL para troca de episódios no player.
                </p>
              </div>
            ), true)}
          </div>

          {/* Imagens */}
          <div>
            <label className={labelCls}>Imagens</label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`${labelCls} text-xs`}>Pôster (URL)</label>
                <input className={inputCls} value={form.poster} onChange={(e) => set({ poster: e.target.value })} placeholder="https://... ou gerar" />
              </div>
              <div>
                <label className={`${labelCls} text-xs`}>Backdrop (URL)</label>
                <input className={inputCls} value={form.backdrop} onChange={(e) => set({ backdrop: e.target.value })} placeholder="https://... ou gerar" />
              </div>
            </div>
            <button
              type="button"
              onClick={autoPoster}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-100 dark:bg-dark-800 text-sm font-medium hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
            >
              <Icon name="trend" size={15} className="text-primary-500" />
              Gerar imagens automáticas
            </button>
            <div className="mt-3 flex gap-3">
              <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-800">
                {form.poster && <img src={form.poster} alt="Prévia do pôster" className="w-full h-full object-cover" onError={(e) => { e.target.src = posterPlaceholder(seed) }} />}
              </div>
              <div className="relative w-28 aspect-[16/9] rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-800">
                {form.backdrop && <img src={form.backdrop} alt="Prévia do backdrop" className="w-full h-full object-cover" onError={(e) => { e.target.src = backdropPlaceholder(seed) }} />}
              </div>
              <p className="text-xs text-dark-400 self-end pb-1">Use "gerar" para criar imagens placeholder automaticamente.</p>
            </div>
          </div>

          {/* Destaque */}
          <label className="flex items-center gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/60 border border-dark-100 dark:border-dark-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set({ featured: e.target.checked })}
              className="w-5 h-5 accent-primary-500"
            />
            <span>
              <span className="block text-sm font-semibold">Destaque na home</span>
              <span className="block text-xs text-dark-500 dark:text-dark-400">Exibe no carrossel principal do site.</span>
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 text-sm border border-red-500/30">
              <Icon name="info" size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-100 dark:border-dark-800 bg-white dark:bg-dark-900">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium border border-dark-300 dark:border-dark-700 hover:border-primary-500 hover:text-primary-500 transition-colors">
            Cancelar
          </button>
          <button onClick={save} className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors inline-flex items-center gap-2">
            <Icon name={isEdit ? 'check' : 'plus'} size={16} />
            {isEdit ? 'Salvar alterações' : 'Adicionar título'}
          </button>
        </div>
      </div>
    </div>
  )
}