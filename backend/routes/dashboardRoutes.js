const express = require('express');
const router = express.Router();
const { getAdminDashboard, getJudgeDashboard, getStaffDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('Admin'), getAdminDashboard);
router.get('/judge', protect, authorize('Judge'), getJudgeDashboard);router.get(
  '/staff',
  protect,
  authorize('CourtStaff', 'Lawyer'), // ✅ ADD Lawyer
  getStaffDashboard
);

module.exports = router;
