import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import Icon from '../../components/Icon'
import { avatarPlaceholder, posterPlaceholder } from '../../utils/placeholder'
import { readImageFile } from '../../utils/image'

export default function AdminUsers() {
  const { users, user: currentUser, addUser, updateUser, deleteUser, resetUsers } = useAuth()
  const { titles } = useData()
  const [q, setQ] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', role: 'user', avatar: null })
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const fileRef = useRef(null)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(q.toLowerCase()) ||
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email?.toLowerCase().includes(q.toLowerCase()),
  )

  const openAdd = () => {
    setEditing(null)
    setForm({ username: '', name: '', email: '', password: '', role: 'user', avatar: null })
    setError('')
    setOpenForm(true)
  }

  const openEdit = (u) => {
    setEditing(u)
    setForm({
      username: u.username || '',
      name: u.name,
      email: u.email || '',
      password: '',
      role: u.role,
      avatar: u.avatar || null,
    })
    setError('')
    setOpenForm(true)
  }

  const handleAvatar = async (file) => {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 4MB.')
      return
    }
    try {
      const dataUrl = await readImageFile(file)
      setForm((f) => ({ ...f, avatar: dataUrl }))
      setError('')
    } catch {
      setError('Não foi possível carregar a imagem.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const save = () => {
    const username = form.username.trim()
    if (!username) {
      setError('Defina um nome de usuário.')
      return
    }
    if (!form.name.trim()) {
      setError('Preencha o nome.')
      return
    }
    if (!editing && !form.password.trim()) {
      setError('Defina uma senha.')
      return
    }
    const dup = users.some(
      (u) =>
        u.id !== editing?.id &&
        (u.username?.toLowerCase() === username.toLowerCase() ||
          (form.email.trim() && u.email?.toLowerCase() === form.email.trim().toLowerCase())),
    )
    if (dup) {
      setError('Já existe um usuário com este nome de usuário ou e-mail.')
      return
    }
    try {
      if (editing) {
        const patch = {
          username: username.toLowerCase(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          avatar: form.avatar,
        }
        if (form.password.trim()) patch.password = form.password.trim()
        updateUser(editing.id, patch)
        notify('Usuário atualizado.')
      } else {
        addUser({
          username,
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          avatar: form.avatar,
        })
        notify('Usuário criado com sucesso.')
      }
      setOpenForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const confirmDelete = () => {
    if (!deleting) return
    if (deleting.id === currentUser?.id) {
      notify('Você não pode excluir sua própria conta.')
      setDeleting(null)
      return
    }
    deleteUser(deleting.id)
    notify(`"${deleting.name}" removido.`)
    setDeleting(null)
  }

  const adminCount = users.filter((u) => u.role === 'admin').length

  const viewingFavorites = (viewing?.favorites || [])
    .map((id) => titles.find((t) => t.id === id))
    .filter(Boolean)

  const removeFavorite = (titleId) => {
    updateUser(viewing.id, { favorites: (viewing.favorites || []).filter((id) => id !== titleId) })
    setViewing((v) => ({ ...v, favorites: (v.favorites || []).filter((id) => id !== titleId) }))
    notify('Título removido dos favoritos.')
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Usuários</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
            {users.length} usuário{users.length !== 1 && 's'} registrados • {adminCount} administrador{adminCount !== 1 && 'es'}.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          <Icon name="plus" size={16} /> Novo usuário
        </button>
      </header>

      <div className="mb-6 relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
          <Icon name="search" size={16} />
        </span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuário..." className="input pl-9" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-dark-50 dark:bg-dark-800/50 text-dark-500 dark:text-dark-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Usuário</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Função</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Favoritos</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Criado em</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || avatarPlaceholder(u.name)} alt={u.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="truncate">@{u.username || u.email}</span>
                          {u.id === currentUser?.id && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 uppercase">você</span>
                          )}
                        </p>
                        <p className="text-xs text-dark-400 truncate">{u.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <SelectRole value={u.role} onChange={(role) => { updateUser(u.id, { role }); notify(`Função de "${u.username || u.name}" alterada para ${role === 'admin' ? 'administrador' : 'usuário'}.`) }} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-dark-400">
                    <button
                      onClick={() => setViewing(u)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-100 dark:bg-dark-800 hover:bg-primary-500/15 hover:text-primary-500 transition-colors"
                      title="Ver favoritos"
                    >
                      <Icon name="list" size={13} /> {u.favorites.length}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-dark-400">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all" title="Editar">
                        <Icon name="edit" size={16} />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => setDeleting(u)} className="p-2 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Excluir">
                          <Icon name="trash" size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Icon name="users" size={40} className="mx-auto text-dark-300 dark:text-dark-600" />
            <p className="mt-3 font-semibold">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      <div className="mt-6 card p-4 flex flex-wrap items-center justify-between gap-3 animate-slide-up">
        <div>
          <p className="text-sm font-semibold">Restaurar usuários padrão</p>
          <p className="text-xs text-dark-400">Remove todas as alterações e recria as contas de demonstração.</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Restaurar os usuários padrão? Você será desconectado.')) {
              resetUsers()
              notify('Usuários restaurados.')
            }
          }}
          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors"
        >
          Restaurar
        </button>
      </div>

      {/* Modal formulário */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setOpenForm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-900 p-6 animate-scale-in shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold">{editing ? 'Editar usuário' : 'Novo usuário'}</h3>
              <button onClick={() => setOpenForm(false)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
                <Icon name="x" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome de usuário</label>
                <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Ex.: maria.silva" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nome completo</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Maria Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">E-mail <span className="text-dark-400 font-normal">(opcional)</span></label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="exemplo@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Senha {editing && <span className="text-dark-400 font-normal">(deixe vazio para manter)</span>}</label>
                <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Função</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Imagem do perfil</label>
                <div className="flex items-center gap-4">
                  <img
                    src={form.avatar || avatarPlaceholder(form.username || form.name || 'Novo usuário')}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-dark-200 dark:ring-dark-700"
                  />
                  <div className="space-y-1">
                    {form.avatar && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, avatar: null })}
                        className="block text-xs text-red-500 hover:underline"
                      >
                        Remover imagem
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-100 dark:bg-dark-800 text-xs font-semibold hover:bg-primary-500/15 hover:text-primary-500 transition-colors"
                    >
                      <Icon name="upload" size={13} /> Carregar imagem
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatar(e.target.files?.[0])}
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm border border-red-500/30">
                  <Icon name="info" size={16} /> <span>{error}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium border border-dark-300 dark:border-dark-700 hover:border-primary-500 hover:text-primary-500 transition-colors">
                Cancelar
              </button>
              <button onClick={save} className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
                {editing ? 'Salvar' : 'Criar usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal favoritos */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-dark-900 p-6 animate-scale-in shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold">Favoritos de {viewing.name}</h3>
              <button onClick={() => setViewing(null)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
                <Icon name="x" />
              </button>
            </div>
            {viewingFavorites.length === 0 ? (
              <div className="py-10 text-center">
                <Icon name="list" size={38} className="mx-auto text-dark-300 dark:text-dark-600" />
                <p className="mt-3 font-semibold">Lista vazia</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">Este usuário ainda não adicionou favoritos.</p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-dark-100 dark:divide-dark-800">
                {viewingFavorites.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-2.5">
                    <img
                      src={t.poster || posterPlaceholder(t.title, t.title)}
                      alt={t.title}
                      className="w-10 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      <p className="text-xs text-dark-400">{t.type === 'movie' ? 'Filme' : 'Série'}</p>
                    </div>
                    <button
                      onClick={() => removeFavorite(t.id)}
                      className="p-2 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Remover dos favoritos"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal excluir */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setDeleting(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-900 p-6 text-center animate-scale-in shadow-2xl">
            <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-red-500/10 text-red-500 mx-auto">
              <Icon name="trash" size={26} />
            </span>
            <h3 className="mt-4 text-lg font-display font-bold">Excluir usuário?</h3>
            <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
              <strong className="text-dark-900 dark:text-dark-100">"{deleting.name}"</strong> perderá o acesso ao painel.
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary-500 text-white text-sm font-medium shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  )
}

function SelectRole({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-2.5 py-1.5 rounded-full text-xs font-bold border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors ${
        value === 'admin' ? 'bg-primary-500/15 text-primary-500' : 'bg-dark-100 dark:bg-dark-800 text-dark-400'
      }`}
    >
      <option value="user">Usuário</option>
      <option value="admin">Admin</option>
    </select>
  )
}