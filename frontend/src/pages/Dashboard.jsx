import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{title}</p>
      {loading ? (
        <div className="h-9 w-16 bg-slate-100 animate-pulse mt-1 rounded"></div>
      ) : (
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
      )}
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/incidents/dashboard/stats`);
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Security Overview</h2>
        <p className="text-slate-500">Real-time crime incident analytics and trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Incidents" 
          value={stats?.total || 0} 
          icon={<FileText className="text-blue-600" />} 
          color="bg-blue-50"
          loading={loading}
        />
        <StatCard 
          title="Active Cases" 
          value={stats?.active || 0} 
          icon={<AlertTriangle className="text-amber-600" />} 
          color="bg-amber-50"
          loading={loading}
        />
        <StatCard 
          title="Solved Cases" 
          value={stats?.solved || 0} 
          icon={<CheckCircle className="text-emerald-600" />} 
          color="bg-emerald-50"
          loading={loading}
        />
        <StatCard 
          title="Unique Types" 
          value={stats?.byType?.length || 0} 
          icon={<Shield className="text-indigo-600" />} 
          color="bg-indigo-50"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Crime Type Distribution</h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : stats?.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byType}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Volume by Type */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Incident Volume by Category</h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : stats?.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
