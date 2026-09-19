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
  10751: 'Aventura',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Drama',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Drama',
  53: 'Suspense',
  10752: 'Ação',
  37: 'Aventura',
  10759: 'Ação',
  10762: 'Animação',
  10763: 'Documentário',
  10764: 'Documentário',
  10765: 'Ficção Científica',
  10766: 'Drama',
  10767: 'Drama',
  10768: 'Ação',
}

const accentFree = (s = '') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const TMDB_NAME_MAP = {
  'familia': 'Aventura',
  'musica': 'Drama',
  'guerra': 'Ação',
  'faroeste': 'Aventura',
  'programa de tv': 'Drama',
  'TV Movie': 'Drama',
  'novela': 'Drama',
  'talk show': 'Drama',
  'noticias': 'Documentário',
  'reality': 'Documentário',
  'criancas': 'Animação',
  'kids': 'Animação',
  'acao e aventura': 'Ação',
  'ficcao cientifica e fantasia': 'Ficção Científica',
  'guerra e politica': 'Ação',
  'soap': 'Drama',
  'sobrenatural': 'Fantasia',
  'mistério': 'Mistério',
  'drama dacomedia': 'Comédia',
  'misterio': 'Mistério',
  'crime': 'Crime',
  'terror': 'Terror',
  'suspense': 'Suspense',
  'thriller': 'Suspense',
  'romance': 'Romance',
  'comedia': 'Comédia',
  'animacao': 'Animação',
  'documentario': 'Documentário',
  'aventura': 'Aventura',
  'acao': 'Ação',
  'drama': 'Drama',
  'fantasia': 'Fantasia',
  'ficcao cientifica': 'Ficção Científica',
  'historia': 'História',
  'misterio_': 'Mistério',
}

function mapGenre(name = '') {
  const n = accentFree(name)
  const direct = GENRES.find((g) => accentFree(g) === n)
  if (direct) return direct
  return TMDB_NAME_MAP[n] || ''
}

function addGenre(acc, label) {
  if (!label) return
  const key = accentFree(label)
  if (!acc.some((g) => accentFree(g) === key)) acc.push(label)
}

export function mapGenres(item = {}) {
  const acc = []
  const ids = item.genre_ids || []
  const names = (item.genres || []).map((g) => g.name || '')
  ;[...ids.map((id) => genreMapById[id] || ''), ...names.map(mapGenre)].forEach((label) => addGenre(acc, label))
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
    genres: mapGenres(item),
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
    streamType: 'embed',
    streamUrl: '',
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