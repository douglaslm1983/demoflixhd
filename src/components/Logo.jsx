import { Icon } from './Icon'

export default function Logo({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary-500 text-white shadow-lg shadow-primary-500/30">
        <Icon name="play" size={16} fill="#fff" />
      </span>
      {!compact && (
        <span className="font-display font-extrabold text-xl md:text-2xl tracking-tight leading-none">
          Demo<span className="text-primary-500">Flix</span>{' '}
          <span className="text-[10px] align-super font-sans font-bold bg-primary-500/15 text-primary-500 px-1.5 py-0.5 rounded">
            HD
          </span>
        </span>
      )}
    </span>
  )
}