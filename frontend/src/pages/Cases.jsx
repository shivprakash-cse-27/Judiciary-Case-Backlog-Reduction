import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlinePlus, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineSortDescending,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CaseCard from '../components/CaseCard';
import toast from 'react-hot-toast';

const Cases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    sort: 'oldest'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [filters, pagination.page]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { search, status, priority, sort } = filters;
      const res = await api.get('/cases', {
        params: {
          search,
          status,
          priority,
          sort,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      if (res.data.success) {
        setCases(res.data.data);
        setPagination({ ...pagination, total: res.data.pagination.total, pages: res.data.pagination.pages });
      }
    } catch (err) {
      toast.error('Failed to fetch cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      sort: 'oldest'
    });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-2xl relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by case title, case number, or keyword..."
            className="form-input pl-12 pr-4 py-3 text-base"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-slate-700 text-white' : ''}`}
          >
            <HiOutlineFilter size={20} />
            Filters
            {(filters.status !== 'all' || filters.priority !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-500 ml-1"></span>
            )}
          </button>
          
          {(user.role === 'Admin' || user.role === 'CourtStaff' || user.role === 'Lawyer') && (
            <Link to="/cases/add" className="btn-primary">
              <HiOutlinePlus size={20} />
              <span className="hidden sm:inline">File Case</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select">
                  <option value="all">All Statuses</option>
                  <option value="Filed">Filed</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Hearing Scheduled">Hearing Scheduled</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Priority</label>
                <select name="priority" value={filters.priority} onChange={handleFilterChange} className="form-select">
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Sort By</label>
                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="form-select">
                  <option value="oldest">Filing Date: Oldest First</option>
                  <option value="newest">Filing Date: Newest First</option>
                  <option value="priority">Priority: Highest First</option>
                  <option value="status">Status Order</option>
                </select>
              </div>

              <div className="flex items-end">
                <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-white transition-colors py-3">
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>Showing {cases.length} of {pagination.total} cases</p>
        <div className="flex items-center gap-2">
          {filters.sort === 'oldest' && (
            <span className="flex items-center gap-1 text-amber-500/80">
              <HiOutlineSortDescending size={16} />
              Prioritizing backlogs
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-48 animate-pulse bg-slate-800/40"></div>
          ))}
        </div>
      ) : cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cases.map((c, i) => (
            <CaseCard key={c._id} caseItem={c} index={i} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiOutlineExclamationCircle className="mx-auto text-slate-700 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No cases found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button onClick={clearFilters} className="mt-6 text-blue-400 font-medium">Clear All Filters</button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30"
          >
            <HiOutlineChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPagination({ ...pagination, page: i + 1 })}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  pagination.page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30"
          >
            <HiOutlineChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Cases;
