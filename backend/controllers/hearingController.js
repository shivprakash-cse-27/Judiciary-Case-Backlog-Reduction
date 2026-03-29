const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const { validationResult } = require('express-validator');

// @desc    Get all hearings
// @route   GET /api/hearings
// @access  Private
exports.getHearings = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'Judge') {
      query.judgeId = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hearings = await Hearing.find(query)
      .populate({
        path: 'caseId',
        select: 'caseTitle caseNumber status priority'
      })
      .populate('judgeId', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hearing.countDocuments(query);

    res.status(200).json({
      success: true,
      data: hearings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create hearing
// @route   POST /api/hearings
// @access  Private (Admin, CourtStaff)
exports.createHearing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { caseId, judgeId, date, courtroom, notes } = req.body;

    // Verify case exists
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const hearing = await Hearing.create({
      caseId,
      judgeId,
      date,
      courtroom,
      notes
    });

    // Update case status and hearing date
    await Case.findByIdAndUpdate(caseId, {
      status: 'Hearing Scheduled',
      hearingDate: date,
      assignedJudge: judgeId
    });

    const populated = await Hearing.findById(hearing._id)
      .populate({ path: 'caseId', select: 'caseTitle caseNumber status' })
      .populate('judgeId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Hearing scheduled successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hearing
// @route   PUT /api/hearings/:id
// @access  Private
exports.updateHearing = async (req, res) => {
  try {
    let hearing = await Hearing.findById(req.params.id);
    if (!hearing) {
      return res.status(404).json({ success: false, message: 'Hearing not found' });
    }

    hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate({ path: 'caseId', select: 'caseTitle caseNumber' })
      .populate('judgeId', 'name email');

    // If hearing completed, update case
    if (req.body.status === 'Completed') {
      await Case.findByIdAndUpdate(hearing.caseId, { status: 'Closed' });
    }

    res.status(200).json({
      success: true,
      message: 'Hearing updated successfully',
      data: hearing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
