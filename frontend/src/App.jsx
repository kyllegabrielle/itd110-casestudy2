import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import AddIncident from './pages/AddIncident'
import EditIncident from './pages/EditIncident'
import UserManagement from './pages/UserManagement'
import NetworkMap from './pages/NetworkMap'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/network" element={<NetworkMap />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-incident"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Officer']}>
                  <AddIncident />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-incident/:id"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Officer']}>
                  <EditIncident />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App
