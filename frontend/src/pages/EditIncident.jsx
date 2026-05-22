import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditIncident = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [existingTypes, setExistingTypes] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    crimeType: '',
    description: '',
    date: '',
    time: '',
    status: '',
    locationName: '',
    barangay: '',
    suspectName: '',
    victimName: '',
    officerName: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentRes, typesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/incidents/${id}`),
          axios.get(`${API_BASE_URL}/api/v1/incidents/types/list`)
        ]);
        setFormData(incidentRes.data.data);
        setExistingTypes(typesRes.data.data);
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to fetch required data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      await axios.put(`${API_BASE_URL}/api/v1/incidents/${id}`, formData);
      setFeedback({ type: 'success', message: 'Incident updated successfully!' });
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to update incident.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Loading incident data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/incidents')}
            className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Edit Incident</h2>
            <p className="text-slate-500 text-sm">Update the information for this incident record.</p>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{feedback.message}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-semibold text-slate-700">Incident Title</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Crime Type</label>
            <input 
              list="crime-types"
              name="crimeType"
              value={formData.crimeType}
              onChange={handleChange}
              required
              type="text" 
              placeholder="Select or type new type..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
            <datalist id="crime-types">
              {existingTypes.map((type, idx) => (
                <option key={idx} value={type} />
              ))}
              <option value="Theft" />
              <option value="Assault" />
              <option value="Robbery" />
              <option value="Vandalism" />
              <option value="Cybercrime" />
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="Active">Active</option>
              <option value="Solved">Solved</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Date</label>
            <input 
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              type="date" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Time</label>
            <input 
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              type="time" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Location Name</label>
            <input 
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Barangay</label>
            <input 
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Suspect Name</label>
            <input 
              name="suspectName"
              value={formData.suspectName}
              onChange={handleChange}
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Victim Name</label>
            <input 
              name="victimName"
              value={formData.victimName}
              onChange={handleChange}
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-semibold text-slate-700">Officer in Charge</label>
            <input 
              name="officerName"
              value={formData.officerName}
              onChange={handleChange}
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="pt-4 col-span-2">
            <button 
              type="submit" 
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-bold transition-all shadow-lg ${
                saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={20} />
                  Update Incident
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIncident;
