import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import AddIncident from './pages/AddIncident'
import EditIncident from './pages/EditIncident'

function App() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/add-incident" element={<AddIncident />} />
            <Route path="/edit-incident/:id" element={<EditIncident />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
