import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SEED_TITLES, DEFAULT_SETTINGS, uid } from '../data/catalog'

const TITLES_KEY = 'demoflix_titles_v1'
const MYLIST_KEY = 'demoflix_mylist_v1'
const SETTINGS_KEY = 'demoflix_settings_v1'

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
  const [titles, setTitles] = useState(() => load(TITLES_KEY, SEED_TITLES))
  const [myList, setMyList] = useState(() => load(MYLIST_KEY, []))
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...load(SETTINGS_KEY, {}) }))

  useEffect(() => save(TITLES_KEY, titles), [titles])
  useEffect(() => save(MYLIST_KEY, myList), [myList])
  useEffect(() => save(SETTINGS_KEY, settings), [settings])

  const movies = titles.filter((t) => t.type === 'movie')
  const series = titles.filter((t) => t.type === 'series')
  const featured = titles.filter((t) => t.featured)

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
    setMyList((prev) => prev.filter((x) => x !== id))
  }, [])

  const resetCatalog = useCallback(() => {
    setTitles(SEED_TITLES)
  }, [])

  const toggleMyList = useCallback((id) => {
    setMyList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

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
    resetCatalog,
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