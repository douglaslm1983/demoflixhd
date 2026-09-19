import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useData } from '../context/DataContext'

export default function Footer() {
  const { settings } = useData()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-dark-200 dark:border-dark-800 mt-16">
      {settings.maintenance && (
        <div className="bg-red-500/10 border-b border-red-500/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 text-center text-xs font-medium text-red-500">
            🛠️ Modo manutenção ativo — alguns recursos podem estar temporariamente indisponíveis.
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/">
            <Logo />
          </Link>
          <p className="mt-3 text-sm text-dark-500 dark:text-dark-400">{settings.tagline}</p>
          <p className="mt-2 text-xs text-dark-400 dark:text-dark-500">
            Projeto demo — conteúdo fictício.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Navegação</h4>
          <ul className="space-y-2 text-sm text-dark-500 dark:text-dark-400">
            <li><Link to="/filmes" className="hover:text-primary-500">Filmes</Link></li>
            <li><Link to="/series" className="hover:text-primary-500">Séries</Link></li>
            <li><Link to="/minha-lista" className="hover:text-primary-500">Minha lista</Link></li>
            <li><Link to="/busca" className="hover:text-primary-500">Busca</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Administração</h4>
          <ul className="space-y-2 text-sm text-dark-500 dark:text-dark-400">
            <li><Link to="/admin/login" className="hover:text-primary-500">Entrar no painel</Link></li>
            <li><Link to="/admin" className="hover:text-primary-500">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Sobre</h4>
          <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
            {settings.siteName} é um site moderno e responsivo construído com React, Vite e Tailwind
            CSS como demonstração de catálogo de filmes e séries.
          </p>
        </div>
      </div>
      <div className="border-t border-dark-200 dark:border-dark-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-dark-400 dark:text-dark-500">
          <span>© {year} {settings.siteName}. Todos os direitos reservados.</span>
          <span>Feito com 💜 para demonstração.</span>
        </div>
      </div>
    </footer>
  )
}