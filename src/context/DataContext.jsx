import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SEED_TITLES, DEFAULT_SETTINGS, uid } from '../data/catalog'
import { useAuth } from './AuthContext'

const TITLES_KEY = 'demoflix_titles_v1'
const SETTINGS_KEY = 'demoflix_settings_v1'
const EMPTY_LIST = []

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user, toggleFavorite, removeFavoritesFor, clearAllFavorites } = useAuth()
  const [titles, setTitles] = useState(() => load(TITLES_KEY, SEED_TITLES))
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...load(SETTINGS_KEY, {}) }))

  useEffect(() => save(TITLES_KEY, titles), [titles])
  useEffect(() => save(SETTINGS_KEY, settings), [settings])

  const movies = titles.filter((t) => t.type === 'movie')
  const series = titles.filter((t) => t.type === 'series')
  const featured = titles.filter((t) => t.featured)

  const myList = user?.favorites || EMPTY_LIST

  const getTitle = useCallback((type, id) => titles.find((t) => t.type === type && t.id === id), [titles])

  const search = useCallback(
    (q) => {
      const term = String(q || '').trim().toLowerCase()
      if (!term) return []
      return titles.filter((t) => {
        const haystack = [t.title, t.originalTitle, t.slug, ...t.genres, ...(t.cast || [])]
          .join(' ')
          .toLowerCase()
        return haystack.includes(term)
      })
    },
    [titles],
  )

  const addTitle = useCallback((data) => {
    const entry = {
      id: uid(data.type === 'movie' ? 'm' : 's'),
      type: data.type || 'movie',
      poster: '',
      backdrop: '',
      cast: [],
      quality: 'HD',
      ageRating: 'L',
      featured: false,
      addedAt: new Date().toISOString(),
      ...data,
    }
    setTitles((prev) => [entry, ...prev])
    return entry
  }, [])

  const updateTitle = useCallback((id, data) => {
    setTitles((prev) => prev.map((t) => (t.id === id ? { ...t, ...data, id } : t)))
  }, [])

  const deleteTitle = useCallback((id) => {
    setTitles((prev) => prev.filter((t) => t.id !== id))
    removeFavoritesFor([id])
  }, [removeFavoritesFor])

  const deleteMany = useCallback((ids) => {
    const set = new Set(ids)
    setTitles((prev) => prev.filter((t) => !set.has(t.id)))
    removeFavoritesFor(ids)
  }, [removeFavoritesFor])

  const resetCatalog = useCallback(() => {
    setTitles(SEED_TITLES)
  }, [])

  const clearCatalog = useCallback(() => {
    setTitles([])
    clearAllFavorites()
  }, [clearAllFavorites])

  const toggleMyList = useCallback(
    (id) => {
      toggleFavorite(id)
    },
    [toggleFavorite],
  )

  const isInMyList = useCallback((id) => myList.includes(id), [myList])

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const myListTitles = myList
    .map((id) => titles.find((t) => t.id === id))
    .filter(Boolean)

  const value = {
    titles,
    movies,
    series,
    featured,
    myList,
    myListTitles,
    settings,
    getTitle,
    search,
    addTitle,
    updateTitle,
    deleteTitle,
    deleteMany,
    resetCatalog,
    clearCatalog,
    toggleMyList,
    isInMyList,
    updateSettings,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider')
  return ctx
}