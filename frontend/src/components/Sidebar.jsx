import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShieldAlert, PlusCircle, LogOut, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { isOfficer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, show: true },
    { name: 'Incidents', path: '/incidents', icon: <ShieldAlert size={20} />, show: true },
    { name: 'Add Incident', path: '/add-incident', icon: <PlusCircle size={20} />, show: isOfficer() },
    { name: 'Users', path: '/users', icon: <Users size={20} />, show: isAdmin() },
  ]

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl">
      <div className="p-6 text-center border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">CIMS</h1>
        <p className="text-xs text-slate-400 mt-1">Crime Mapping System</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
