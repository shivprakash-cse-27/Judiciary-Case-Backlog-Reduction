import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlinePencilAlt, 
  HiOutlineSave, 
  HiOutlineChevronLeft,
  HiOutlineTrash,
  HiOutlineLibrary,
  HiOutlineCalendar,
  HiOutlineStatusOnline
} from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EditCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [judges, setJudges] = useState([]);

  const [formData, setFormData] = useState({
    caseTitle: '',
    description: '',
    priority: 'Medium',
    status: 'Filed',
    assignedJudge: '',
    filingDate: ''
  });

  useEffect(() => {
    fetchCaseData();
    fetchJudges();
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      if (res.data.success) {
        const c = res.data.data;
        setFormData({
          caseTitle: c.caseTitle,
          description: c.description,
          priority: c.priority,
          status: c.status,
          assignedJudge: c.assignedJudge?._id || '',
          filingDate: c.filingDate ? new Date(c.filingDate).toISOString().split('T')[0] : ''
        });
      }
    } catch (err) {
      toast.error('Failed to load case data');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchJudges = async () => {
    try {
      const res = await api.get('/users?role=Judge');
      if (res.data.success) {
        setJudges(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load judges');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put(`/cases/${id}`, formData);
      if (res.data.success) {
        toast.success('Case updated successfully');
        navigate('/cases');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update case');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      try {
        const res = await api.delete(`/cases/${id}`);
        if (res.data.success) {
          toast.success('Case deleted successfully');
          navigate('/cases');
        }
      } catch (err) {
        toast.error('Failed to delete case');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary px-3 py-2 text-sm">
          <HiOutlineChevronLeft size={20} />
          Back
        </button>
        <div className="flex gap-2">
          {user.role === 'Admin' && (
            <button onClick={handleDelete} className="btn-danger p-2 text-white">
              <HiOutlineTrash size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-8 bg-slate-900/40 relative overflow-hidden">
        {/* Decorator */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
            <HiOutlinePencilAlt size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Update Case File</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="form-label">Case Title</label>
              <input
                type="text"
                name="caseTitle"
                value={formData.caseTitle}
                onChange={handleChange}
                className="form-input text-lg font-semibold"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Case Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="form-input resize-none bg-slate-800/40"
                required
              ></textarea>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <HiOutlineStatusOnline className="text-blue-400" />
                  Case Status
                </label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select font-medium text-blue-300">
                  <option value="Filed">Filed</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Hearing Scheduled">Hearing Scheduled</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  Priority Level
                </label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent / Immediate</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <HiOutlineLibrary className="text-amber-400" />
                  Assigned Judge
                </label>
                <select name="assignedJudge" value={formData.assignedJudge} onChange={handleChange} className="form-select">
                  <option value="">Unassigned</option>
                  {judges.map(j => (
                    <option key={j._id} value={j._id}>{j.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-2">Only Judges with capacity are shown in full list.</p>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <HiOutlineCalendar className="text-purple-400" />
                  Filing Date
                </label>
                <input
                  type="date"
                  name="filingDate"
                  value={formData.filingDate}
                  onChange={handleChange}
                  className="form-input opacity-70"
                  readOnly={user.role !== 'Admin'}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/50 flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[140px] justify-center">
              {saving ? <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white"></div> : (
                <>
                  <HiOutlineSave size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditCase;
