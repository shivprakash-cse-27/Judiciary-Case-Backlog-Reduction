import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, label, value, trend, color = 'blue', delay = 0 }) => {
  const colorMap = {
    blue: { bg: 'from-blue-600/20 to-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', glow: 'shadow-blue-500/10' },
    amber: { bg: 'from-amber-600/20 to-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400', glow: 'shadow-amber-500/10' },
    emerald: { bg: 'from-emerald-600/20 to-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    red: { bg: 'from-red-600/20 to-red-500/10', border: 'border-red-500/20', icon: 'text-red-400', glow: 'shadow-red-500/10' },
    purple: { bg: 'from-purple-600/20 to-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', glow: 'shadow-purple-500/10' },
    indigo: { bg: 'from-indigo-600/20 to-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`
        relative overflow-hidden p-5 rounded-2xl
        bg-gradient-to-br ${c.bg}
        border ${c.border}
        backdrop-blur-sm
        hover:shadow-lg ${c.glow}
        transition-all duration-300
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/60 ${c.icon}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      {/* Decorative gradient circle */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${c.bg} opacity-40 blur-xl`} />
    </motion.div>
  );
};

export default StatsCard;
