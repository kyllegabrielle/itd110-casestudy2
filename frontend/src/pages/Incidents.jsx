import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, Download, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIncidents = async (keyword = '') => {
    setLoading(true);
    try {
      const url = keyword 
        ? `${API_BASE_URL}/api/v1/incidents/search/${keyword}`
        : `${API_BASE_URL}/api/v1/incidents`;
      
      const response = await axios.get(url);
      setIncidents(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load incidents. Please check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIncidents(searchTerm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/incidents/${id}`);
        setIncidents(incidents.filter(inc => inc.incidentId !== id));
        alert('Incident deleted successfully.');
      } catch (err) {
        alert('Failed to delete incident.');
      }
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/incidents/backup/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'incidents_backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download backup.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Incident Management</h2>
          <p className="text-slate-500">View and manage all recorded crime incidents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </form>
          <button 
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition-all shadow-sm"
          >
            <Download size={18} />
            Backup JSON
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Fetching incident data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-8 rounded-xl flex flex-col items-center text-center">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => fetchIncidents()} className="mt-4 text-red-600 underline text-sm">Try Again</button>
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white border border-slate-100 p-20 rounded-xl flex flex-col items-center text-center shadow-sm">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Search className="text-slate-300" size={40} />
          </div>
          <p className="text-slate-600 font-medium text-lg">No incidents found</p>
          <p className="text-slate-400">Try adjusting your search or add a new incident record.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Incident Details</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Type & Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Location</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Entities (S/V/O)</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Date & Time</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {incidents.map((incident) => (
                <tr key={incident.incidentId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{incident.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{incident.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700 font-medium">{incident.crimeType}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                      incident.status === 'Solved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{incident.locationName}</p>
                    <p className="text-xs text-slate-400">{incident.barangay}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600"><span className="text-slate-400">S:</span> {incident.suspectName}</p>
                    <p className="text-slate-600"><span className="text-slate-400">V:</span> {incident.victimName}</p>
                    <p className="text-slate-600"><span className="text-slate-400">O:</span> {incident.officerName}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <p>{incident.date}</p>
                    <p className="text-xs text-slate-400">{incident.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(incident.incidentId)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Incidents;
