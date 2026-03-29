const mongoose = require('mongoose');
const User = require('./models/User');
const Case = require('./models/Case');
const Hearing = require('./models/Hearing');

const seedData = async () => {
  try {
    console.log('--- Seeding Process Started ---');

    console.log('1. Clearing existing records...');
    await User.deleteMany({});
    await Case.deleteMany({});
    await Hearing.deleteMany({});
    console.log('✅ Collections cleared.');

    console.log('2. Creating users sequentially...');
    const userData = [
      { name: 'Admin User', email: 'admin@judiciary.com', password: 'admin123', role: 'Admin' },
      { name: 'Justice R.K. Sharma', email: 'judge1@judiciary.com', password: 'judge123', role: 'Judge' },
      { name: 'Justice M.L. Gupta', email: 'judge2@judiciary.com', password: 'judge123', role: 'Judge' },
      { name: 'Justice S. Patel', email: 'judge3@judiciary.com', password: 'judge123', role: 'Judge' },
      { name: 'Priya Mehta', email: 'staff@judiciary.com', password: 'staff123', role: 'CourtStaff' },
      { name: 'Adv. Rajesh Kumar', email: 'lawyer1@judiciary.com', password: 'lawyer123', role: 'Lawyer' },
      { name: 'Adv. Sneha Reddy', email: 'lawyer2@judiciary.com', password: 'lawyer123', role: 'Lawyer' }
    ];

    const users = [];
    for (const u of userData) {
      const newUser = await User.create(u);
      users.push(newUser);
      console.log(`   - Created user: ${u.email}`);
    }
    console.log('✅ Users created.');

    const admin = users[0];
    const judges = users.filter(u => u.role === 'Judge');
    const staff = users.find(u => u.role === 'CourtStaff');
    const lawyers = users.filter(u => u.role === 'Lawyer');

    console.log('3. Creating cases sequentially...');
    const casesData = [
      { caseTitle: 'State vs. Arun Mishra - Criminal Appeal', description: 'Criminal appeal regarding theft and burglary charges filed in lower court. Defendant seeks acquittal based on lack of evidence.', status: 'Pending', priority: 'High', assignedJudge: judges[0]._id, createdBy: lawyers[0]._id, filingDate: new Date('2025-06-15') },
      { caseTitle: 'Ram Prasad vs. Municipal Corporation', description: 'Civil dispute regarding illegal demolition of property. Petitioner claims violation of due process and seeks compensation.', status: 'Under Review', priority: 'Medium', assignedJudge: judges[1]._id, createdBy: lawyers[1]._id, filingDate: new Date('2025-08-20') },
      { caseTitle: 'Mehta Industries vs. Tax Department', description: 'Tax evasion case involving undisclosed income from overseas operations. Department seeks recovery of INR 50 crore.', status: 'Hearing Scheduled', priority: 'Urgent', assignedJudge: judges[0]._id, hearingDate: new Date('2026-04-10'), createdBy: staff._id, filingDate: new Date('2025-03-10') },
      { caseTitle: 'Public Interest Litigation - River Pollution', description: 'PIL filed by environmental activists regarding industrial pollution of river Yamuna. Seeks immediate shutdown of polluting factories.', status: 'Filed', priority: 'Urgent', createdBy: lawyers[0]._id, filingDate: new Date('2026-01-05') },
      { caseTitle: 'Workers Union vs. Sunrise Textiles', description: 'Labor dispute regarding unpaid wages and unsafe working conditions. Union represents 500+ workers.', status: 'Pending', priority: 'High', assignedJudge: judges[2]._id, createdBy: lawyers[1]._id, filingDate: new Date('2025-11-01') },
      { caseTitle: 'Sharma Family Property Dispute', description: 'Partition suit between family members over ancestral property worth INR 10 crore in central Delhi.', status: 'Under Review', priority: 'Medium', assignedJudge: judges[1]._id, createdBy: lawyers[0]._id, filingDate: new Date('2025-09-15') },
      { caseTitle: 'State vs. Cybercrime Syndicate', description: 'Cybercrime case involving data theft and financial fraud. Multiple accused with international connections.', status: 'Hearing Scheduled', priority: 'Urgent', assignedJudge: judges[2]._id, hearingDate: new Date('2026-04-15'), createdBy: admin._id, filingDate: new Date('2025-07-22') },
      { caseTitle: 'Insurance Claim - Gupta vs. LIC', description: 'Disputed insurance claim of INR 2 crore. Claimant alleges wrongful denial by insurance company.', status: 'Filed', priority: 'Low', createdBy: lawyers[1]._id, filingDate: new Date('2026-02-10') },
      { caseTitle: 'Consumer Forum - Defective Vehicle', description: 'Consumer complaint against automobile manufacturer for selling a defective vehicle. Seeks replacement and compensation.', status: 'Pending', priority: 'Medium', assignedJudge: judges[0]._id, createdBy: lawyers[0]._id, filingDate: new Date('2025-12-05') },
      { caseTitle: 'Land Acquisition Compensation', description: 'Farmers challenge inadequate compensation for land acquired for highway project. Seek market rate compensation.', status: 'Closed', priority: 'High', assignedJudge: judges[1]._id, createdBy: staff._id, filingDate: new Date('2024-06-15') },
      { caseTitle: 'Divorce Petition - Singh vs. Singh', description: 'Contested divorce petition with disputes over child custody and alimony. Case involves domestic violence allegations.', status: 'Pending', priority: 'Medium', assignedJudge: judges[2]._id, createdBy: lawyers[1]._id, filingDate: new Date('2025-10-20') },
      { caseTitle: 'Corruption Case - Government Official', description: 'Anti-corruption case against senior government official for accepting bribes. CBI investigation ongoing.', status: 'Under Review', priority: 'Urgent', assignedJudge: judges[0]._id, createdBy: admin._id, filingDate: new Date('2025-04-12') },
      { caseTitle: 'Patent Infringement - Tech Corp', description: 'Patent infringement suit by a tech startup against a multinational corporation. Claims theft of AI algorithm.', status: 'Filed', priority: 'High', createdBy: lawyers[0]._id, filingDate: new Date('2026-03-01') },
      { caseTitle: 'Medical Negligence Suit', description: 'Medical malpractice case against hospital for wrongful surgery leading to permanent disability.', status: 'Hearing Scheduled', priority: 'High', assignedJudge: judges[1]._id, hearingDate: new Date('2026-04-20'), createdBy: lawyers[1]._id, filingDate: new Date('2025-05-18') },
      { caseTitle: 'Electoral Malpractice Petition', description: 'Election petition challenging results of municipal elections due to alleged booth capturing and voter intimidation.', status: 'Closed', priority: 'Urgent', assignedJudge: judges[2]._id, createdBy: admin._id, filingDate: new Date('2024-12-01') }
    ];

    const cases = [];
    for (const c of casesData) {
      const newCase = await Case.create(c);
      cases.push(newCase);
      console.log(`   - Created case: ${c.caseTitle} (${newCase.caseNumber})`);
    }
    console.log('✅ Cases created.');

    console.log('4. Creating hearings...');
    const hearingsData = [
      { caseId: cases[2]._id, judgeId: judges[0]._id, date: new Date('2026-04-10'), courtroom: 'Courtroom-1', status: 'Scheduled', notes: 'First hearing on tax evasion matter' },
      { caseId: cases[6]._id, judgeId: judges[2]._id, date: new Date('2026-04-15'), courtroom: 'Courtroom-3', status: 'Scheduled', notes: 'Cybercrime evidence presentation' },
      { caseId: cases[13]._id, judgeId: judges[1]._id, date: new Date('2026-04-20'), courtroom: 'Courtroom-2', status: 'Scheduled', notes: 'Medical expert testimony' },
      { caseId: cases[9]._id, judgeId: judges[1]._id, date: new Date('2025-12-15'), courtroom: 'Courtroom-2', status: 'Completed', notes: 'Final verdict delivered' },
      { caseId: cases[14]._id, judgeId: judges[2]._id, date: new Date('2025-10-20'), courtroom: 'Courtroom-3', status: 'Completed', notes: 'Petition dismissed' },
      { caseId: cases[0]._id, judgeId: judges[0]._id, date: new Date('2026-05-05'), courtroom: 'Courtroom-1', status: 'Scheduled', notes: 'Arguments hearing' },
      { caseId: cases[4]._id, judgeId: judges[2]._id, date: new Date('2026-04-25'), courtroom: 'Courtroom-4', status: 'Scheduled', notes: 'Workers testimony hearing' }
    ];

    await Hearing.create(hearingsData);
    console.log('✅ Hearings created.');

    console.log('✨ SEEDING COMPLETED SUCCESSFULLY ✨');
    return true;
  } catch (error) {
    console.error('❌ SEED ERROR:', error);
    return false;
  }
};

module.exports = seedData;

if (require.main === module) {
  require('dotenv').config();
  console.log('Attempting to connect to Atlas...');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('Connected to Atlas.');
      const success = await seedData();
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Connection failed:', err);
      process.exit(1);
    });
}
