import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Trash2, Download, AlertCircle, Loader2, 
  Edit2, Eye, CheckCircle, X, MapPin, User, Shield, Calendar, Clock, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Incidents = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);

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
    const delayDebounceFn = setTimeout(() => {
      fetchIncidents(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/incidents/${id}`);
        setIncidents(incidents.filter(inc => inc.incidentId !== id));
      } catch (err) {
        alert('Failed to delete incident.');
      }
    }
  };

  const handleMarkAsSolved = async () => {
    if (!selectedIncident || selectedIncident.status === 'Solved') return;
    
    try {
      const updatedIncident = { ...selectedIncident, status: 'Solved' };
      await axios.put(`${API_BASE_URL}/api/v1/incidents/${selectedIncident.incidentId}`, updatedIncident);
      
      setIncidents(incidents.map(inc => 
        inc.incidentId === selectedIncident.incidentId ? { ...inc, status: 'Solved' } : inc
      ));
      
      setIsSolveModalOpen(false);
      setIsViewModalOpen(false); // Close view modal if it was open
      setSelectedIncident(null);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const openViewModal = (incident) => {
    setSelectedIncident(incident);
    setIsViewModalOpen(true);
  };

  const openSolveModal = (incident) => {
    setSelectedIncident(incident);
    setIsSolveModalOpen(true);
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
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Incident Management</h2>
          <p className="text-slate-500">View and manage all recorded crime incidents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search across all fields..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>
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
          <p className="font-medium">Updating results...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-8 rounded-xl flex flex-col items-center text-center">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => fetchIncidents(searchTerm)} className="mt-4 text-red-600 underline text-sm">Try Again</button>
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
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Crime Type</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Status</th>
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
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                      {incident.crimeType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openViewModal(incident)}
                        className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/edit-incident/${incident.incidentId}`)}
                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Incident"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => openSolveModal(incident)}
                        disabled={incident.status === 'Solved'}
                        className={`p-2 rounded-lg transition-all ${
                          incident.status === 'Solved' 
                            ? 'text-emerald-400 cursor-not-allowed' 
                            : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title="Mark as Solved"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(incident.incidentId)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Incident"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Incident Report</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">ID: {selectedIncident.incidentId.split('-')[0]}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedIncident(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-slate-800">{selectedIncident.title}</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Shield size={16} className="text-slate-400" />
                    <span className="text-xs uppercase font-bold tracking-wider">Classification</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Crime Type</p>
                    <p className="text-slate-800 font-bold">{selectedIncident.crimeType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                      selectedIncident.status === 'Solved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedIncident.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-xs uppercase font-bold tracking-wider">Location & Time</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1"><Calendar size={12}/> Date</p>
                      <p className="text-slate-800 font-bold">{selectedIncident.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1"><Clock size={12}/> Time</p>
                      <p className="text-slate-800 font-bold">{selectedIncident.time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Location</p>
                    <p className="text-slate-800 font-bold">{selectedIncident.locationName}</p>
                    <p className="text-xs text-slate-500">{selectedIncident.barangay}</p>
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <User size={16} className="text-slate-400" />
                    <span className="text-xs uppercase font-bold tracking-wider">Involved Parties</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Suspect</p>
                      <p className="text-slate-800 font-bold truncate">{selectedIncident.suspectName}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Victim</p>
                      <p className="text-slate-800 font-bold truncate">{selectedIncident.victimName}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Officer</p>
                      <p className="text-slate-800 font-bold truncate">{selectedIncident.officerName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              {selectedIncident.status !== 'Solved' && (
                <button 
                  onClick={() => setIsSolveModalOpen(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                >
                  <CheckCircle size={18} />
                  Mark as Solved
                </button>
              )}
              <button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  navigate(`/edit-incident/${selectedIncident.incidentId}`);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                <Edit2 size={18} />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOLVE CONFIRMATION MODAL */}
      {isSolveModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirm Case Closure</h3>
              <p className="text-slate-500">
                Are you sure you want to mark <strong>"{selectedIncident.title}"</strong> as solved? 
                This action will update the incident status across the system.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button 
                onClick={() => {
                  setIsSolveModalOpen(false);
                  if (!isViewModalOpen) setSelectedIncident(null);
                }}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
              >
                No, Keep {selectedIncident.status}
              </button>
              <button 
                onClick={handleMarkAsSolved}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
              >
                Yes, Mark Solved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
