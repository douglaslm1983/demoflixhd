import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/main/Home'
import Movies from './pages/main/Movies'
import Series from './pages/main/Series'
import Details from './pages/main/Details'
import Search from './pages/main/Search'
import MyList from './pages/main/MyList'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMovies from './pages/admin/Movies'
import AdminSeries from './pages/admin/Series'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import NotFound from './pages/main/NotFound'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="filmes" element={<Movies />} />
        <Route path="series" element={<Series />} />
        <Route path="busca" element={<Search />} />
        <Route path="minha-lista" element={<MyList />} />
        <Route path="detalhes/:type/:id" element={<Details />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="filmes" element={<AdminMovies />} />
        <Route path="series" element={<AdminSeries />} />
        <Route path="usuarios" element={<AdminUsers />} adminOnly />
        <Route path="configuracoes" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}

export default App