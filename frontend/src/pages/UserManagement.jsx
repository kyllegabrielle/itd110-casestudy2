import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { UserPlus, Shield, User, Mail, Lock, AlertCircle, CheckCircle2, Loader2, Users, Edit, Trash2, X } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'Officer'
  });

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const response = await axiosInstance.get('/auth/users');
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password
      name: user.name,
      email: user.email,
      role: user.role
    });
    setFeedback({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'Officer'
    });
    setFeedback({ type: '', message: '' });
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/auth/users/${user.id}`);
      setFeedback({ type: 'success', message: `User "${user.username}" deleted successfully.` });
      fetchUsers();
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to delete user.' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingUser) {
        // Prepare data for update (only include password if it's not empty)
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await axiosInstance.put(`/auth/users/${editingUser.id}`, updateData);
        setFeedback({ 
          type: 'success', 
          message: `User "${formData.username}" updated successfully!` 
        });
        setEditingUser(null);
      } else {
        await axiosInstance.post('/auth/register', formData);
        setFeedback({ 
          type: 'success', 
          message: `User "${formData.username}" created successfully as ${formData.role}!` 
        });
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'Officer'
      });
      
      // Refresh user list
      fetchUsers();
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user. Please try again.` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500">Manage system users and their access levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CREATE/EDIT USER FORM */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {editingUser ? <Edit size={20} className="text-amber-600" /> : <UserPlus size={20} className="text-blue-600" />}
                {editingUser ? 'Edit Account' : 'Create New Account'}
              </span>
              {editingUser && (
                <button 
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </h3>

            {feedback.message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 border mb-6 animate-in fade-in slide-in-from-top-2 duration-300 ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-sm font-medium">{feedback.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    type="text" 
                    placeholder="jramos_01" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password {editingUser && <span className="text-[10px] lowercase font-normal text-slate-400">(Leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    type="text" 
                    placeholder="Juan Ramos" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    type="email" 
                    placeholder="ramos@cims.com" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Officer">Officer</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-bold transition-all mt-4 ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : editingUser 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editingUser ? <Edit size={18} /> : <UserPlus size={18} />}
                {loading ? 'Processing...' : editingUser ? 'Update Account' : 'Create Account'}
              </button>
              
              {editingUser && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full text-slate-500 py-2 text-sm font-medium hover:text-slate-800 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* USER LIST TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-slate-600" />
                Registered Users
              </h3>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                {users.length} Total
              </span>
            </div>

            {fetching ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-sm">Fetching users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <User size={48} className="mx-auto mb-2 opacity-20" />
                <p>No other users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-slate-400">Name & Email</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-slate-400">Username</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-slate-400">Role</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-bold text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                            @{u.username}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'Officer' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit User"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
