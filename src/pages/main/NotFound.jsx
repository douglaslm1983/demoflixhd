import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center">
      <p className="text-8xl md:text-9xl font-display font-extrabold text-primary-500/20 leading-none">404</p>
      <h1 className="mt-4 text-2xl md:text-4xl font-display font-bold">Página não encontrada</h1>
      <p className="mt-3 text-dark-500 dark:text-dark-400 max-w-md mx-auto">
        O endereço que você acessou não existe ou foi movido. Vamos voltar para o início?
      </p>
      <div className="mt-8 flex justify-center gap-3 flex-wrap">
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600">
          <Icon name="home" size={16} /> Voltar ao início
        </Link>
        <Link to="/filmes" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-dark-300 dark:border-dark-700 font-semibold hover:border-primary-500 hover:text-primary-500">
          <Icon name="film" size={16} /> Ver filmes
        </Link>
      </div>
    </div>
  )
}