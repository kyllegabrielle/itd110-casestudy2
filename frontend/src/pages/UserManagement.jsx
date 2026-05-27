import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { UserPlus, Shield, User, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'Officer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      await axiosInstance.post('/auth/register', formData);
      setFeedback({ 
        type: 'success', 
        message: `User "${formData.username}" created successfully as ${formData.role}!` 
      });
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'Officer'
      });
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to create user. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <p className="text-slate-500">Create and assign roles to new system users.</p>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 duration-300 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{feedback.message}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                Username
              </label>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                type="text" 
                placeholder="e.g. jramos_01" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Lock size={16} className="text-slate-400" />
                Password
              </label>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield size={16} className="text-slate-400" />
                Full Name
              </label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                type="text" 
                placeholder="e.g. Juan Ramos" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                Email Address
              </label>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                type="email" 
                placeholder="ramos@cims.com" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield size={16} className="text-slate-400" />
                System Role
              </label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              >
                <option value="Admin">Admin (Full System Access)</option>
                <option value="Officer">Officer (Case Management)</option>
                <option value="Viewer">Viewer (Read-Only/Analyst)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Roles determine what parts of the system the user can access and modify.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-bold transition-all shadow-lg ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create User Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
