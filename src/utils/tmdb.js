import { GENRES } from '../data/catalog'

const API = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p'

const genreMapById = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Programa de TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
}

const accentFree = (s = '') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function mapGenre(name = '') {
  const n = accentFree(name)
  const found = GENRES.find((g) => accentFree(g) === n)
  return found || name
}

export function mapGenres(ids = [], names = []) {
  const acc = []
  ids.forEach((id) => {
    const label = genreMapById[id]
    if (label && !acc.includes(label)) acc.push(label)
  })
  names.forEach((n) => {
    const label = mapGenre(n)
    if (label && !acc.includes(label)) acc.push(label)
  })
  return acc
}

export async function tmdbRequest(key, path, params = {}) {
  const qs = new URLSearchParams({ api_key: key, language: 'pt-BR', ...params })
  const res = await fetch(`${API}${path}?${qs}`)
  if (!res.ok) {
    let msg = `Erro TMDB (${res.status})`
    try {
      const body = await res.json()
      if (body?.status_message) msg = body.status_message
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return res.json()
}

export const tmdbSearch = (key, media, query, page = 1) =>
  tmdbRequest(key, `/search/${media}`, { query, page })

export const tmdbPopular = (key, media, page = 1) =>
  tmdbRequest(key, `/${media}/popular`, { page })

export const tmdbDetails = (key, media, id) =>
  tmdbRequest(key, `/${media}/${id}`, { append_to_response: 'credits' })

export const tmdbImage = (path, size = 'w500') => (path ? `${IMG}/${size}${path}` : '')

const slugify = (s = '') =>
  s.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function summary(item, media) {
  const title = media === 'movie' ? item.title : item.name
  const originalTitle = media === 'movie' ? item.original_title : item.original_name
  const date = media === 'movie' ? item.release_date : item.first_air_date
  return {
    tmdbId: item.id,
    title: title || originalTitle || 'Sem título',
    originalTitle: originalTitle || title || '',
    slug: slugify(title || originalTitle || ''),
    year: Number(String(date || '').slice(0, 4)) || new Date().getFullYear(),
    genres: mapGenres(item.genre_ids || [], []),
  }
}

export function toTitle(item, media, extra = {}) {
  const base = summary(item, media)
  return {
    type: media === 'movie' ? 'movie' : 'series',
    ...base,
    rating: Number(item.vote_average) || 0,
    duration: Number(item.runtime) || 0,
    seasons: Number(item.number_of_seasons) || 1,
    episodes: Number(item.number_of_episodes) || 1,
    synopsis: item.overview || '',
    cast: (item.credits?.cast || []).slice(0, 6).map((c) => c.name),
    quality: 'HD',
    ageRating: 'L',
    featured: false,
    poster: tmdbImage(item.poster_path, 'w500'),
    backdrop: tmdbImage(item.backdrop_path, 'w1280'),
    addedAt: new Date().toISOString(),
    tmdb: {
      media,
      id: item.id,
      url: `https://www.themoviedb.org/${media}/${item.id}`,
    },
    ...extra,
  }
}