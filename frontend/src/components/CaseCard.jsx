import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineUser, HiOutlineCalendar } from 'react-icons/hi';
import { motion } from 'framer-motion';

const CaseCard = ({ caseItem, index = 0 }) => {
  const getStatusBadge = (status) => {
    const map = {
      'Filed': 'badge-filed',
      'Pending': 'badge-pending',
      'Under Review': 'badge-review',
      'Hearing Scheduled': 'badge-hearing',
      'Closed': 'badge-closed'
    };
    return map[status] || 'badge-filed';
  };

  const getPriorityBadge = (priority) => {
    const map = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Urgent': 'priority-urgent'
    };
    return map[priority] || 'priority-medium';
  };

  const pendingDays = () => {
    if (caseItem.status === 'Closed') return 0;
    const filed = new Date(caseItem.filingDate);
    const now = new Date();
    return Math.ceil((now - filed) / (1000 * 60 * 60 * 24));
  };

  const days = pendingDays();
  const isUrgent = caseItem.priority === 'Urgent' && caseItem.status !== 'Closed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`glass-card p-5 ${isUrgent ? 'urgent-glow border-red-500/30' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link
            to={`/cases/${caseItem._id}/edit`}
            className="text-base font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1"
          >
            {caseItem.caseTitle}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{caseItem.caseNumber}</p>
        </div>
        <span className={`badge ${getPriorityBadge(caseItem.priority)} ml-2 shrink-0`}>
          {caseItem.priority}
        </span>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{caseItem.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        {caseItem.assignedJudge && (
          <span className="flex items-center gap-1">
            <HiOutlineUser size={14} />
            {caseItem.assignedJudge.name || 'Unassigned'}
          </span>
        )}
        {caseItem.hearingDate && (
          <span className="flex items-center gap-1">
            <HiOutlineCalendar size={14} />
            {new Date(caseItem.hearingDate).toLocaleDateString()}
          </span>
        )}
        {caseItem.status !== 'Closed' && (
          <span className={`flex items-center gap-1 ${days > 180 ? 'text-red-400' : days > 90 ? 'text-amber-400' : ''}`}>
            <HiOutlineClock size={14} />
            {days} days pending
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`badge ${getStatusBadge(caseItem.status)}`}>
          {caseItem.status}
        </span>
        <Link
          to={`/cases/${caseItem._id}/edit`}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  );
};

export default CaseCard;
