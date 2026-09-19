import Icon from './Icon'

const COLORS = { L: 'bg-green-500', 10: 'bg-blue-500', 12: 'bg-cyan-500', 14: 'bg-yellow-500', 16: 'bg-orange-500', 18: 'bg-red-600' }

export function RatingStars({ value = 0, size = 14, showValue = false }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Nota ${value}`}>
      {stars.map((s) => (
        <Icon
          key={s}
          name="star"
          size={size}
          className={s <= Math.round(value / 2) ? 'text-yellow-400' : 'text-dark-300 dark:text-dark-600'}
        />
      ))}
      {showValue && <span className="ml-1 text-sm font-semibold text-dark-700 dark:text-dark-200">{value.toFixed(1)}</span>}
    </span>
  )
}

export function MetaBadge({ ageRating, quality }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {ageRating && (
        <span className={`inline-grid place-items-center w-6 h-6 rounded text-[11px] font-bold text-white ${COLORS[ageRating] || 'bg-gray-500'}`}>
          {ageRating}
        </span>
      )}
      {quality && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-dark-800/90 dark:bg-dark-900/90 text-white tracking-wide">
          {quality}
        </span>
      )}
    </span>
  )
}

export function formatDuration(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h ${m}min` : `${m}min`
}