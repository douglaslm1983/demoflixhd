import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const USERS_KEY = 'demoflix_users_v1'
const SESSION_KEY = 'demoflix_session_v1'

const DEFAULT_USERS = [
  {
    id: 'u1',
    email: 'admin@demoflix.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u2',
    email: 'user@demoflix.com',
    password: 'user123',
    name: 'Usuário Demo',
    role: 'user',
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return DEFAULT_USERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_USERS
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

  const login = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 500))
    const found = users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
    if (!found || found.password !== password) {
      throw new Error('E-mail ou senha incorretos')
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

  const addUser = useCallback(({ name, email, password, role = 'user', avatar = null }) => {
    const clean = String(email).trim().toLowerCase()
    if (!name?.trim() || !clean || !password) {
      throw new Error('Preencha nome, e-mail e senha.')
    }
    let dup = false
    setUsers((prev) => {
      if (prev.some((u) => u.email.toLowerCase() === clean)) {
        dup = true
        return prev
      }
      const nueva = {
        id: `u${Date.now().toString(36)}`,
        email: clean,
        password,
        name: name.trim(),
        role,
        avatar,
        createdAt: new Date().toISOString(),
      }
      return [...prev, nueva]
    })
    if (dup) throw new Error('Já existe um usuário com este e-mail.')
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