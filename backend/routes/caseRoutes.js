const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  suggestSchedule
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/auth');

const caseValidation = [
  body('caseTitle').trim().notEmpty().withMessage('Case title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['Filed', 'Pending', 'Under Review', 'Hearing Scheduled', 'Closed'])
    .withMessage('Invalid status')
];

router.route('/')
  .get(protect, getCases)
  .post(protect, authorize('Admin', 'CourtStaff', 'Lawyer'), caseValidation, createCase);

router.route('/:id')
  .get(protect, getCaseById)
  .put(protect, updateCase)
  .delete(protect, authorize('Admin'), deleteCase);

router.get('/:id/suggest-schedule', protect, suggestSchedule);

module.exports = router;
