import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import PosterCard from '../../components/PosterCard'
import Icon from '../../components/Icon'

export default function MyList() {
  const { myListTitles } = useData()
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
        {isAuthenticated ? `Minha lista de ${user?.name || 'assistir depois'}` : 'Minha lista'}
      </h1>
      <p className="mt-2 text-dark-500 dark:text-dark-400">
        {myListTitles.length} título{myListTitles.length !== 1 && 's'} salvos para assistir depois
      </p>

      {myListTitles.length === 0 ? (
        <div className="py-20 text-center">
          <Icon name="list" size={44} className="mx-auto text-dark-300 dark:text-dark-600" />
          <p className="mt-4 text-lg font-semibold">{isAuthenticated ? 'Sua lista está vazia' : 'Sua lista fica aqui'}</p>
          <p className="text-sm text-dark-500 dark:text-dark-400 max-w-md mx-auto">
            {isAuthenticated
              ? 'Explore o catálogo e adicione filmes e séries que você quer assistir depois tocando no ícone +.'
              : 'Faça login com sua conta para salvar filmes e séries na sua lista pessoal.'}
          </p>
          {isAuthenticated ? (
            <Link to="/filmes" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600">
              <Icon name="film" size={16} /> Explorar catálogo
            </Link>
          ) : (
            <Link to="/entrar" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600">
              <Icon name="log-in" size={16} /> Fazer login
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
          {myListTitles.map((t) => (
            <PosterCard key={t.id} title={t} width="w-full" />
          ))}
        </div>
      )}
    </div>
  )
}