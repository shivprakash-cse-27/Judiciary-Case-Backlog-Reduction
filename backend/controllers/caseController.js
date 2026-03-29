const Case = require('../models/Case');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all cases with filtering, search, sort, pagination
// @route   GET /api/cases
// @access  Private
exports.getCases = async (req, res) => {
  try {
    const { status, priority, search, startDate, endDate, judge, sort, page = 1, limit = 10 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'Judge') {
      query.assignedJudge = req.user._id;
    } else if (req.user.role === 'Lawyer') {
      query.createdBy = req.user._id;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Judge filter
    if (judge) {
      query.assignedJudge = judge;
    }

    // Date range filter
    if (startDate || endDate) {
      query.filingDate = {};
      if (startDate) query.filingDate.$gte = new Date(startDate);
      if (endDate) query.filingDate.$lte = new Date(endDate);
    }

    // Search by title or case number
    if (search) {
      query.$or = [
        { caseTitle: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options (default: oldest first for backlog reduction)
    let sortOption = { filingDate: 1 }; // oldest first
    if (sort === 'newest') sortOption = { filingDate: -1 };
    if (sort === 'priority') sortOption = { priority: -1, filingDate: 1 };
    if (sort === 'status') sortOption = { status: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cases = await Case.find(query)
      .populate('assignedJudge', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Case.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cases,
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

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('assignedJudge', 'name email')
      .populate('createdBy', 'name email');

    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create case
// @route   POST /api/cases
// @access  Private (Admin, CourtStaff, Lawyer)
exports.createCase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const caseData = {
      ...req.body,
      createdBy: req.user._id
    };

    const newCase = await Case.create(caseData);
    const populated = await Case.findById(newCase._id)
      .populate('assignedJudge', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
exports.updateCase = async (req, res) => {
  try {
    let caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Only Admin, assigned Judge, or creator can update
    const canUpdate =
      req.user.role === 'Admin' ||
      (caseItem.assignedJudge && caseItem.assignedJudge.toString() === req.user._id.toString()) ||
      caseItem.createdBy.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this case' });
    }

    caseItem = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedJudge', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: caseItem
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private (Admin only)
exports.deleteCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    await Case.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get auto-schedule suggestion
// @route   GET /api/cases/:id/suggest-schedule
// @access  Private
exports.suggestSchedule = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Find the judge with the least upcoming hearings
    const judges = await User.find({ role: 'Judge' });
    const Hearing = require('../models/Hearing');

    const judgeWorkloads = await Promise.all(
      judges.map(async (judge) => {
        const count = await Hearing.countDocuments({
          judgeId: judge._id,
          status: 'Scheduled',
          date: { $gte: new Date() }
        });
        return { judge, count };
      })
    );

    judgeWorkloads.sort((a, b) => a.count - b.count);
    const suggestedJudge = judgeWorkloads[0];

    // Suggest next available weekday
    let suggestedDate = new Date();
    suggestedDate.setDate(suggestedDate.getDate() + 3); // at least 3 days out
    while (suggestedDate.getDay() === 0 || suggestedDate.getDay() === 6) {
      suggestedDate.setDate(suggestedDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      suggestion: {
        judge: suggestedJudge ? {
          id: suggestedJudge.judge._id,
          name: suggestedJudge.judge.name,
          currentWorkload: suggestedJudge.count
        } : null,
        suggestedDate: suggestedDate,
        courtroom: `Courtroom-${Math.floor(Math.random() * 10) + 1}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
