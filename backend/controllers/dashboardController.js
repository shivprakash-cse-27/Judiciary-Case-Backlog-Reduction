const Case = require('../models/Case');
const User = require('../models/User');
const Hearing = require('../models/Hearing');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    // Total counts
    const totalCases = await Case.countDocuments();
    const pendingCases = await Case.countDocuments({ status: { $in: ['Filed', 'Pending', 'Under Review'] } });
    const hearingScheduled = await Case.countDocuments({ status: 'Hearing Scheduled' });
    const closedCases = await Case.countDocuments({ status: 'Closed' });
    const urgentCases = await Case.countDocuments({ priority: 'Urgent', status: { $ne: 'Closed' } });
    const totalJudges = await User.countDocuments({ role: 'Judge' });
    const totalHearings = await Hearing.countDocuments();
    const totalUsers = await User.countDocuments();

    // Cases by status
    const casesByStatus = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Cases by priority
    const casesByPriority = await Case.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly case filing trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Case.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          filed: { $sum: 1 },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendsFormatted = monthlyTrends.map(t => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      filed: t.filed,
      closed: t.closed
    }));

    // Judge workload distribution
    const judgeWorkload = await Case.aggregate([
      { $match: { assignedJudge: { $ne: null }, status: { $ne: 'Closed' } } },
      { $group: { _id: '$assignedJudge', caseCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'judge'
        }
      },
      { $unwind: '$judge' },
      {
        $project: {
          judgeName: '$judge.name',
          caseCount: 1
        }
      },
      { $sort: { caseCount: -1 } }
    ]);

    // Average pending duration
    const pendingCasesData = await Case.find({ status: { $ne: 'Closed' } });
    const avgPendingDays = pendingCasesData.length > 0
      ? Math.round(pendingCasesData.reduce((sum, c) => {
          const days = Math.ceil((new Date() - new Date(c.filingDate)) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / pendingCasesData.length)
      : 0;

    // Recent cases
    const recentCases = await Case.find()
      .populate('assignedJudge', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming hearings
    const upcomingHearings = await Hearing.find({
      date: { $gte: new Date() },
      status: 'Scheduled'
    })
      .populate({ path: 'caseId', select: 'caseTitle caseNumber' })
      .populate('judgeId', 'name')
      .sort({ date: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCases,
          pendingCases,
          hearingScheduled,
          closedCases,
          urgentCases,
          totalJudges,
          totalHearings,
          totalUsers,
          avgPendingDays
        },
        casesByStatus,
        casesByPriority,
        monthlyTrends: trendsFormatted,
        judgeWorkload,
        recentCases,
        upcomingHearings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get judge dashboard stats
// @route   GET /api/dashboard/judge
// @access  Private (Judge)
exports.getJudgeDashboard = async (req, res) => {
  try {
    const judgeId = req.user._id;

    const assignedCases = await Case.countDocuments({ assignedJudge: judgeId });
    const pendingCases = await Case.countDocuments({
      assignedJudge: judgeId,
      status: { $in: ['Filed', 'Pending', 'Under Review'] }
    });
    const hearingScheduled = await Case.countDocuments({
      assignedJudge: judgeId,
      status: 'Hearing Scheduled'
    });
    const closedCases = await Case.countDocuments({
      assignedJudge: judgeId,
      status: 'Closed'
    });
    const urgentCases = await Case.countDocuments({
      assignedJudge: judgeId,
      priority: 'Urgent',
      status: { $ne: 'Closed' }
    });

    // My upcoming hearings
    const upcomingHearings = await Hearing.find({
      judgeId,
      date: { $gte: new Date() },
      status: 'Scheduled'
    })
      .populate({ path: 'caseId', select: 'caseTitle caseNumber priority status' })
      .sort({ date: 1 })
      .limit(10);

    // My recent cases
    const recentCases = await Case.find({ assignedJudge: judgeId })
      .sort({ updatedAt: -1 })
      .limit(5);

    // Cases by status for this judge
    const casesByStatus = await Case.aggregate([
      { $match: { assignedJudge: judgeId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          assignedCases,
          pendingCases,
          hearingScheduled,
          closedCases,
          urgentCases
        },
        casesByStatus,
        upcomingHearings,
        recentCases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff dashboard stats
// @route   GET /api/dashboard/staff
// @access  Private (CourtStaff)
exports.getStaffDashboard = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const filedToday = await Case.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const pendingCases = await Case.countDocuments({ status: { $in: ['Filed', 'Pending'] } });
    const hearingsToday = await Hearing.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const recentCases = await Case.find()
      .populate('assignedJudge', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const upcomingHearings = await Hearing.find({
      date: { $gte: new Date() },
      status: 'Scheduled'
    })
      .populate({ path: 'caseId', select: 'caseTitle caseNumber' })
      .populate('judgeId', 'name')
      .sort({ date: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCases,
          filedToday,
          pendingCases,
          hearingsToday
        },
        recentCases,
        upcomingHearings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
