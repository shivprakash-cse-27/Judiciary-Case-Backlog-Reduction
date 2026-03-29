import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineFolder, 
  HiOutlineClock, 
  HiOutlineCalendar, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import CaseCard from '../components/CaseCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'Admin' ? '/dashboard/admin' : 
                       user.role === 'Judge' ? '/dashboard/judge' : '/dashboard/staff';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="spinner"></div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user.name}</h1>
          <p className="text-slate-400">Here's what's happening in the system today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-300">System Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'Admin' && data?.stats && (
          <>
            <StatsCard icon={HiOutlineFolder} label="Total Cases" value={data.stats.totalCases} color="blue" delay={0.1} />
            <StatsCard icon={HiOutlineClock} label="Avg. Pending Days" value={data.stats.avgPendingDays} color="amber" delay={0.2} />
            <StatsCard icon={HiOutlineExclamationCircle} label="Urgent Cases" value={data.stats.urgentCases} color="red" delay={0.3} />
            <StatsCard icon={HiOutlineCheckCircle} label="Closed Cases" value={data.stats.closedCases} color="emerald" delay={0.4} />
          </>
        )}
        {user.role === 'Judge' && data?.stats && (
          <>
            <StatsCard icon={HiOutlineFolder} label="My Assigned Cases" value={data.stats.assignedCases} color="blue" delay={0.1} />
            <StatsCard icon={HiOutlineClock} label="Pending Cases" value={data.stats.pendingCases} color="amber" delay={0.2} />
            <StatsCard icon={HiOutlineCalendar} label="Scheduled Hearings" value={data.stats.hearingScheduled} color="purple" delay={0.3} />
            <StatsCard icon={HiOutlineCheckCircle} label="Completed Cases" value={data.stats.closedCases} color="emerald" delay={0.4} />
          </>
        )}
        {user.role === 'CourtStaff' && data?.stats && (
          <>
            <StatsCard icon={HiOutlineFolder} label="Total Records" value={data.stats.totalCases} color="blue" delay={0.1} />
            <StatsCard icon={HiOutlineTrendingUp} label="Filed Today" value={data.stats.filedToday} color="emerald" delay={0.2} />
            <StatsCard icon={HiOutlineClock} label="Pending Review" value={data.stats.pendingCases} color="amber" delay={0.3} />
            <StatsCard icon={HiOutlineCalendar} label="Hearings Today" value={data.stats.hearingsToday} color="purple" delay={0.4} />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          {user.role === 'Admin' && data?.monthlyTrends && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Case Backlog Trends</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Line type="monotone" dataKey="filed" stroke="#3b82f6" strokeWidth={2} name="New Cases" />
                    <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {data?.casesByStatus && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Case Status Distribution</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.casesByStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.casesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Cases for Admin/Staff */}
          {(user.role === 'Admin' || user.role === 'CourtStaff') && data?.recentCases && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Recently Filed Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recentCases.map((c, i) => (
                  <CaseCard key={c._id} caseItem={c} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Upcoming Hearings */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Hearings</h3>
            <div className="space-y-4">
              {data?.upcomingHearings?.length > 0 ? (
                data.upcomingHearings.map((h, i) => (
                  <div key={h._id || i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-blue-400">{h.caseId?.caseNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white line-clamp-1 mb-1">{h.caseId?.caseTitle}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <HiOutlineCalendar size={12} />
                        {new Date(h.date).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] text-slate-500">{h.courtroom}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No hearings scheduled</p>
              )}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              View Calendar
            </button>
          </div>

          {/* Judge Workload (Admin Only) */}
          {user.role === 'Admin' && data?.judgeWorkload && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Judge Workload</h3>
              <div className="space-y-4">
                {data.judgeWorkload.map((judge, i) => (
                  <div key={judge.judgeName || i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{judge.judgeName}</span>
                      <span className="text-slate-500">{judge.caseCount} cases</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${judge.caseCount > 5 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((judge.caseCount / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Actions (Judge Only) */}
          {user.role === 'Judge' && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="btn-secondary justify-start w-full text-sm">Update Hearing Notes</button>
                <button className="btn-secondary justify-start w-full text-sm">Request Case Transfer</button>
                <button className="btn-secondary justify-start w-full text-sm">Finalize Verdict</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
