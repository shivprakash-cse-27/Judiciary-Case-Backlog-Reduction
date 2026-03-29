const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Please provide a case ID']
  },
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a judge ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a hearing date']
  },
  courtroom: {
    type: String,
    required: [true, 'Please provide a courtroom'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Postponed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

hearingSchema.index({ caseId: 1 });
hearingSchema.index({ judgeId: 1 });
hearingSchema.index({ date: 1 });

module.exports = mongoose.model('Hearing', hearingSchema);
