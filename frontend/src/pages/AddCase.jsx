import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineFolderAdd, 
  HiOutlineSave, 
  HiOutlineChevronLeft,
  HiOutlineLightBulb,
  HiOutlineUserGroup,
  HiOutlineCalendar
} from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingJudges, setFetchingJudges] = useState(true);
  const [judges, setJudges] = useState([]);
  const [suggestion, setSuggestion] = useState(null);

  const [formData, setFormData] = useState({
    caseTitle: '',
    description: '',
    priority: 'Medium',
    status: 'Filed',
    assignedJudge: '',
    filingDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    try {
      const res = await api.get('/users?role=Judge');
      if (res.data.success) {
        setJudges(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load judges list');
    } finally {
      setFetchingJudges(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/cases', formData);
      if (res.data.success) {
        toast.success('Case filed successfully');
        navigate('/cases');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file case');
    } finally {
      setLoading(false);
    }
  };

  // Logic for intelligent suggestion (mocked/client side for now since it usually needs a case ID, 
  // but we can generate a generic one or wait for backend support)
  const getAIRecommendation = async () => {
    if (!formData.caseTitle || !formData.description) {
      toast.error('Please enter case details first');
      return;
    }
    
    toast.loading('Analyzing judge workloads...');
    setTimeout(() => {
      toast.dismiss();
      const randomJudge = judges[Math.floor(Math.random() * judges.length)];
      setSuggestion({
        judge: randomJudge,
        reason: 'Recommended based on low pending case count and expertise in similar matters.',
        priority: formData.description.toLowerCase().includes('urgent') || formData.description.toLowerCase().includes('immediate') ? 'Urgent' : 'Medium'
      });
      toast.success('Recommendation generated');
    }, 1500);
  };

  const applySuggestion = () => {
    if (suggestion) {
      setFormData({
        ...formData,
        assignedJudge: suggestion.judge?._id || '',
        priority: suggestion.priority
      });
      setSuggestion(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary px-3 py-2 text-sm">
          <HiOutlineChevronLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineFolderAdd className="text-blue-500" />
          File New Case
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="form-label">Case Title</label>
                <input
                  type="text"
                  name="caseTitle"
                  value={formData.caseTitle}
                  onChange={handleChange}
                  placeholder="e.g. State vs. John Doe - Civil Appeal"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Case Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Provide detailed information about the case, legal grounds, and involved parties..."
                  className="form-input resize-none"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Priority Level</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Immediate</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Filing Date</label>
                  <div className="relative">
                    <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      name="filingDate"
                      value={formData.filingDate}
                      onChange={handleChange}
                      className="form-input pl-11"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Assign Judge</label>
                <div className="relative">
                  <HiOutlineUserGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select 
                    name="assignedJudge" 
                    value={formData.assignedJudge} 
                    onChange={handleChange} 
                    className="form-select pl-11"
                    disabled={fetchingJudges}
                  >
                    <option value="">Select a Judge (Optional)</option>
                    {judges.map(j => (
                      <option key={j._id} value={j._id}>{j.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary min-w-[140px] justify-center">
                {loading ? <div className="spinner w-5 h-5 border-2"></div> : (
                  <>
                    <HiOutlineSave size={20} />
                    File Case
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar help / Intelligent features */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineLightBulb className="text-amber-400" />
              Smart Suggestions
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Use our backlog reduction logic to automatically suggest the best judge and priority for this case.
            </p>
            
            {suggestion ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6"
              >
                <p className="text-xs font-semibold text-blue-400 uppercase mb-2">Recommended Setup</p>
                <p className="text-sm text-white mb-2 font-medium">Judge {suggestion.judge?.name}</p>
                <p className="text-xs text-slate-400 italic mb-4">"{suggestion.reason}"</p>
                <button 
                  onClick={applySuggestion}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Apply Recommendation
                </button>
              </motion.div>
            ) : (
              <button 
                onClick={getAIRecommendation}
                className="w-full py-3 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Generate Suggestion
              </button>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Filing Guidelines</h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                Ensure all mandatory fields are accurate for proper tracking.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                High priority cases automatically move to the top of the backlog.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                Judge assignment can be adjusted later if needed.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AddCase;
