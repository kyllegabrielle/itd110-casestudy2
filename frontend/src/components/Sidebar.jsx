import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShieldAlert, PlusCircle, LogOut } from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Incidents', path: '/incidents', icon: <ShieldAlert size={20} /> },
    { name: 'Add Incident', path: '/add-incident', icon: <PlusCircle size={20} /> },
  ]

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl">
      <div className="p-6 text-center border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">CIMS</h1>
        <p className="text-xs text-slate-400 mt-1">Crime Mapping System</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navItems.map((item) => (
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
        <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
