import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCalendar, 
  HiOutlineOfficeBuilding, 
  HiOutlineUser, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineX
} from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Hearings = () => {
  const { user } = useAuth();
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cases, setCases] = useState([]);
  const [judges, setJudges] = useState([]);
  
  const [newHearing, setNewHearing] = useState({
    caseId: '',
    judgeId: '',
    date: '',
    courtroom: '',
    notes: ''
  });

  useEffect(() => {
    fetchHearings();
    if (user.role === 'Admin' || user.role === 'CourtStaff') {
      fetchCases();
      fetchJudges();
    }
  }, []);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hearings');
      if (res.data.success) {
        setHearings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load hearings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await api.get('/cases?status=Pending');
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cases');
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

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/hearings/${id}`, { status });
      if (res.data.success) {
        toast.success(`Hearing marked as ${status}`);
        fetchHearings();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hearings', newHearing);
      if (res.data.success) {
        toast.success('Hearing scheduled successfully');
        setShowModal(false);
        fetchHearings();
        setNewHearing({ caseId: '', judgeId: '', date: '', courtroom: '', notes: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule hearing');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-400';
      case 'Completed': return 'text-emerald-400';
      case 'Postponed': return 'text-amber-400';
      case 'Cancelled': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineCalendar className="text-blue-500" />
            Hearing Schedule
          </h1>
          <p className="text-slate-400">View and manage upcoming judicial hearings.</p>
        </div>
        
        {(user.role === 'Admin' || user.role === 'CourtStaff') && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <HiOutlinePlus size={20} />
            Schedule Hearing
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case Details</th>
              <th>Judge</th>
              <th>Date & Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-12"><div className="spinner mx-auto"></div></td></tr>
            ) : hearings.length > 0 ? (
              hearings.map((h) => (
                <tr key={h._id}>
                  <td className="max-w-[200px]">
                    <div className="mb-1 text-xs font-mono text-blue-400">{h.caseId?.caseNumber}</div>
                    <div className="text-sm font-medium text-white line-clamp-1">{h.caseId?.caseTitle}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">
                        {h.judgeId?.name?.charAt(0)}
                      </div>
                      <span className="text-sm">{h.judgeId?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium">{new Date(h.date).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm">
                      <HiOutlineOfficeBuilding className="text-slate-500" />
                      {h.courtroom}
                    </div>
                  </td>
                  <td>
                    <span className={`flex items-center gap-1 text-xs font-bold ${getStatusColor(h.status)}`}>
                      {h.status === 'Completed' ? <HiOutlineCheckCircle /> : h.status === 'Cancelled' ? <HiOutlineExclamationCircle /> : null}
                      {h.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      {h.status === 'Scheduled' && (
                        <>
                          <button onClick={() => handleUpdateStatus(h._id, 'Completed')} className="text-xs text-emerald-400 hover:underline">Complete</button>
                          <button onClick={() => handleUpdateStatus(h._id, 'Postponed')} className="text-xs text-amber-400 hover:underline">Postpone</button>
                        </>
                      )}
                      <button className="text-xs text-blue-400 hover:underline">View</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-12 text-slate-500">No hearings found in system</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Schedule New Hearing</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><HiOutlineX size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="form-label">Assign Case</label>
                  <select value={newHearing.caseId} onChange={(e) => setNewHearing({...newHearing, caseId: e.target.value})} className="form-select" required>
                    <option value="">Select a Pending Case</option>
                    {cases.map(c => (
                      <option key={c._id} value={c._id}>[{c.caseNumber}] {c.caseTitle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Assigned Judge</label>
                  <select value={newHearing.judgeId} onChange={(e) => setNewHearing({...newHearing, judgeId: e.target.value})} className="form-select" required>
                    <option value="">Select a Judge</option>
                    {judges.map(j => (
                      <option key={j._id} value={j._id}>{j.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Hearing Date & Time</label>
                    <input type="datetime-local" value={newHearing.date} onChange={(e) => setNewHearing({...newHearing, date: e.target.value})} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Courtroom</label>
                    <input type="text" value={newHearing.courtroom} onChange={(e) => setNewHearing({...newHearing, courtroom: e.target.value})} placeholder="e.g. Courtroom-B2" className="form-input" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4">Schedule Hearing</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hearings;
