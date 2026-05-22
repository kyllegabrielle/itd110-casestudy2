import { Bell, UserCircle, Search } from 'lucide-react'

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-96 border border-slate-200">
        <Search className="text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search incidents, suspects..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">Officer Ramos</p>
            <p className="text-[11px] text-slate-500">System Admin</p>
          </div>
          <UserCircle className="text-slate-400" size={32} />
        </div>
      </div>
    </header>
  )
}

export default Header
