import { Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react'

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
)

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Security Overview</h2>
        <p className="text-slate-500">Welcome to the Crime Incident Mapping System dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Incidents" 
          value="124" 
          icon={<FileText className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Active Cases" 
          value="45" 
          icon={<AlertTriangle className="text-amber-600" />} 
          color="bg-amber-50"
        />
        <StatCard 
          title="Solved Cases" 
          value="79" 
          icon={<CheckCircle className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <StatCard 
          title="Common Crime" 
          value="Theft" 
          icon={<Shield className="text-indigo-600" />} 
          color="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400 border-dashed border-2">
          Analytics Chart Placeholder (Area Chart)
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400 border-dashed border-2">
          Crime Distribution Placeholder (Pie Chart)
        </div>
      </div>
    </div>
  )
}

export default Dashboard
