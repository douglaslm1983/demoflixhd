import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const USERS_KEY = 'demoflix_users_v1'
const SESSION_KEY = 'demoflix_session_v1'

const DEFAULT_USERS = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@demoflix.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    avatar: null,
    favorites: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u2',
    username: 'user',
    email: 'user@demoflix.com',
    password: 'user123',
    name: 'Usuário Demo',
    role: 'user',
    avatar: null,
    favorites: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function normalizeUsers(list) {
  return list.map((u) => ({ favorites: [], username: '', ...u }))
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return DEFAULT_USERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? normalizeUsers(parsed) : DEFAULT_USERS
  } catch {
    return DEFAULT_USERS
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [session, setSession] = useState(loadSession)
  const [loading] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    } catch {
      /* ignore */
    }
  }, [users])

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [session])

  const user = users.find((u) => u.id === session?.userId) || null
  const publicUser = user ? { ...user, password: undefined } : null

  const login = useCallback(async (identifier, password) => {
    await new Promise((r) => setTimeout(r, 500))
    const term = String(identifier).trim().toLowerCase()
    const found = users.find(
      (u) =>
        u.username?.toLowerCase() === term ||
        u.email?.toLowerCase() === term,
    )
    if (!found || found.password !== password) {
      throw new Error('Usuário ou senha incorretos')
    }
    setSession({ userId: found.id, at: new Date().toISOString() })
    return { ...found, password: undefined }
  }, [users])

  const logout = useCallback(() => {
    setSession(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === session?.userId ? { ...u, ...updates } : u)),
    )
  }, [session])

  const toggleFavorite = useCallback((titleId) => {
    if (!session?.userId) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id !== session.userId
          ? u
          : {
              ...u,
              favorites: u.favorites.includes(titleId)
                ? u.favorites.filter((id) => id !== titleId)
                : [...u.favorites, titleId],
            },
      ),
    )
  }, [session])

  const removeFavoritesFor = useCallback((ids) => {
    const set = new Set(ids)
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        favorites: u.favorites.filter((id) => !set.has(id)),
      })),
    )
  }, [])

  const clearAllFavorites = useCallback(() => {
    setUsers((prev) => prev.map((u) => ({ ...u, favorites: [] })))
  }, [])

  const addUser = useCallback(({ username, name, email = '', password, role = 'user', avatar = null }) => {
    const cleanUser = String(username).trim().toLowerCase()
    const cleanEmail = String(email).trim().toLowerCase()
    if (!cleanUser || !name?.trim() || !password) {
      throw new Error('Preencha nome de usuário, nome e senha.')
    }
    let dup = false
    setUsers((prev) => {
      if (
        prev.some(
          (u) =>
            u.username?.toLowerCase() === cleanUser ||
            (cleanEmail && u.email?.toLowerCase() === cleanEmail),
        )
      ) {
        dup = true
        return prev
      }
      const nueva = {
        id: `u${Date.now().toString(36)}`,
        username: cleanUser,
        email: cleanEmail,
        password,
        name: name.trim(),
        role,
        avatar,
        favorites: [],
        createdAt: new Date().toISOString(),
      }
      return [...prev, nueva]
    })
    if (dup) throw new Error('Já existe um usuário com este nome de usuário ou e-mail.')
  }, [])

  const updateUser = useCallback((id, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }, [])

  const deleteUser = useCallback((id) => {
    setUsers((prev) => {
      const target = prev.find((u) => u.id === id)
      if (target?.role === 'admin' && prev.filter((u) => u.role === 'admin').length <= 1) {
        return prev
      }
      return prev.filter((u) => u.id !== id)
    })
  }, [])

  const resetUsers = useCallback(() => {
    setUsers(DEFAULT_USERS)
    setSession(null)
  }, [])

  const value = {
    user: publicUser,
    users,
    loading,
    login,
    logout,
    updateProfile,
    toggleFavorite,
    removeFavoritesFor,
    clearAllFavorites,
    addUser,
    updateUser,
    deleteUser,
    resetUsers,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}