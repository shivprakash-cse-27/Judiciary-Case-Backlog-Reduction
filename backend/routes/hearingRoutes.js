const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getHearings, createHearing, updateHearing } = require('../controllers/hearingController');
const { protect, authorize } = require('../middleware/auth');

const hearingValidation = [
  body('caseId').notEmpty().withMessage('Case ID is required'),
  body('judgeId').notEmpty().withMessage('Judge ID is required'),
  body('date').notEmpty().withMessage('Hearing date is required'),
  body('courtroom').trim().notEmpty().withMessage('Courtroom is required')
];

router.route('/')
  .get(protect, getHearings)
  .post(protect, authorize('Admin', 'CourtStaff'), hearingValidation, createHearing);

router.route('/:id')
  .put(protect, authorize('Admin', 'CourtStaff', 'Judge'), updateHearing);

module.exports = router;
