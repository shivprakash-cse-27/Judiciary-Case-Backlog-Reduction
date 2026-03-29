const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseTitle: {
    type: String,
    required: [true, 'Please provide a case title'],
    trim: true,
    maxlength: [200, 'Case title cannot exceed 200 characters']
  },
  caseNumber: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a case description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['Filed', 'Pending', 'Under Review', 'Hearing Scheduled', 'Closed'],
    default: 'Filed'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedJudge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  hearingDate: {
    type: Date,
    default: null
  },
  filingDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: pending duration in days
caseSchema.virtual('pendingDuration').get(function () {
  if (this.status === 'Closed') return 0;
  const now = new Date();
  const filed = new Date(this.filingDate);
  const diffTime = Math.abs(now - filed);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for performance
caseSchema.index({ status: 1 });
caseSchema.index({ priority: 1 });
caseSchema.index({ assignedJudge: 1 });
caseSchema.index({ filingDate: 1 });
caseSchema.index({ caseNumber: 1 });

// Auto-generate case number before validation
caseSchema.pre('validate', async function (next) {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Case').countDocuments();
    this.caseNumber = `JUD-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);
