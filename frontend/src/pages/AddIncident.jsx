import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const AddIncident = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [existingTypes, setExistingTypes] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    crimeType: '',
    description: '',
    date: '',
    time: '',
    status: 'Active',
    locationName: '',
    barangay: '',
    suspectName: '',
    victimName: '',
    officerName: user?.name || ''
  });

  useEffect(() => {
    if (user?.name && !formData.officerName) {
      setFormData(prev => ({ ...prev, officerName: user.name }));
    }
  }, [user]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await axiosInstance.get('/incidents/types/list');
        setExistingTypes(response.data.data);
      } catch (err) {
        console.error('Failed to fetch crime types', err);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      await axiosInstance.post('/incidents', formData);
      setFeedback({ type: 'success', message: 'Incident recorded successfully!' });
      
      // Refresh notifications to show the new one immediately
      fetchNotifications();
      
      // Clear form
      setFormData({
        title: '',
        crimeType: '',
        description: '',
        date: '',
        time: '',
        status: 'Active',
        locationName: '',
        barangay: '',
        suspectName: '',
        victimName: '',
        officerName: user?.name || ''
      });

      // Redirect after short delay
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to record incident. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add New Incident</h2>
          <p className="text-slate-500">Fill in the details below to record a new crime incident.</p>
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
          {/* Incident Info */}
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-semibold text-slate-700">Incident Title</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              type="text" 
              placeholder="Brief summary of the incident" 
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
              placeholder="Detailed report of the event..." 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            ></textarea>
          </div>

          {/* Location & Time */}
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
              placeholder="e.g. Central Park" 
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
              placeholder="e.g. Brgy. Poblacion" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          {/* People involved */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Suspect Name</label>
            <input 
              name="suspectName"
              value={formData.suspectName}
              onChange={handleChange}
              required
              type="text" 
              placeholder="Full name or 'Unknown'" 
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
              placeholder="Full name or 'Anonymous'" 
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
              placeholder="Name of responding officer" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
            <p className="text-[11px] text-slate-400 italic">Auto-filled from your profile; change if reporting for another officer.</p>
          </div>

          <div className="pt-4 col-span-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-bold transition-all shadow-lg ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Recording...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={20} />
                  Record Incident
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncident;
