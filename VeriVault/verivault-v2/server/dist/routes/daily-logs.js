"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads/daily-logs');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit per file
        files: 20 // Maximum 20 files per submission
    },
    fileFilter: (req, file, cb) => {
        // Accept images, videos, and documents
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mov', 'video/avi', 'video/quicktime',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    }
});
// In-memory storage for daily logs (replace with database)
let dailyLogs = [];
let logIdCounter = 1;
// Submit daily log with files and PIN verification
router.post('/submit', upload.array('attachments'), async (req, res) => {
    try {
        const { formData, verificationData } = req.body;
        if (!formData || !verificationData) {
            return res.status(400).json({
                success: false,
                message: 'Form data and verification data are required'
            });
        }
        // Parse the JSON strings
        const parsedFormData = JSON.parse(formData);
        const parsedVerificationData = JSON.parse(verificationData);
        // Generate submission ID
        const submissionId = `DL-${Date.now().toString(36).toUpperCase()}`;
        // Process uploaded files
        const uploadedFiles = req.files;
        const fileMetadata = uploadedFiles ? uploadedFiles.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            uploadPath: file.path,
            uploadedAt: new Date().toISOString()
        })) : [];
        // Create daily log entry
        const dailyLogEntry = {
            id: logIdCounter++,
            submissionId,
            reportType: 'Daily Log',
            reportDate: parsedFormData.reportDate,
            shiftPeriod: parsedFormData.shiftPeriod,
            officerName: parsedFormData.officerName,
            weatherConditions: parsedFormData.weatherConditions,
            // Activity data
            vendors: parsedFormData.vendors || [],
            guests: parsedFormData.guests || [],
            packages: parsedFormData.packages || [],
            // Patrol data
            patrolRounds: parsedFormData.patrolRounds || [],
            patrolObservations: parsedFormData.patrolObservations || '',
            equipmentStatus: parsedFormData.equipmentStatus || {},
            // Additional data
            generalNotes: parsedFormData.generalNotes || '',
            attachments: fileMetadata,
            // Verification and metadata
            verificationData: parsedVerificationData,
            submittedAt: new Date().toISOString(),
            submittedBy: 'admin', // TODO: Get from JWT token
            // Summary statistics
            summary: {
                totalVendors: parsedFormData.vendors?.length || 0,
                totalGuests: parsedFormData.guests?.length || 0,
                totalPackages: parsedFormData.packages?.length || 0,
                totalAttachments: fileMetadata.length,
                patrolRoundsCompleted: parsedFormData.patrolRounds?.filter((r) => r.time).length || 0,
                equipmentIssues: Object.values(parsedFormData.equipmentStatus || {}).filter(status => status !== 'ok').length
            }
        };
        // Store the daily log
        dailyLogs.push(dailyLogEntry);
        // Generate activity log entry for the logs system
        const activityLogEntry = {
            category: 'daily-log',
            timestamp: new Date().toISOString(),
            location: 'Security Office',
            subject: `Daily Log - ${parsedFormData.reportDate}`,
            action: `Submitted by ${parsedFormData.officerName}`,
            priority: 'low',
            notes: `${dailyLogEntry.summary.totalVendors} vendors, ${dailyLogEntry.summary.totalGuests} guests, ${dailyLogEntry.summary.totalPackages} packages, ${dailyLogEntry.summary.totalAttachments} files`,
            submissionId: submissionId
        };
        // TODO: Also save to main logs system if needed
        // logs.push(activityLogEntry);
        res.status(201).json({
            success: true,
            message: 'Daily log submitted successfully',
            submissionId: submissionId,
            dailyLog: {
                id: dailyLogEntry.id,
                submissionId: dailyLogEntry.submissionId,
                reportDate: dailyLogEntry.reportDate,
                officerName: dailyLogEntry.officerName,
                summary: dailyLogEntry.summary,
                submittedAt: dailyLogEntry.submittedAt
            },
            filesUploaded: fileMetadata.length,
            activityLogEntry: activityLogEntry
        });
    }
    catch (error) {
        console.error('Error submitting daily log:', error);
        // Clean up uploaded files if there was an error
        if (req.files) {
            const uploadedFiles = req.files;
            uploadedFiles.forEach(file => {
                try {
                    fs_1.default.unlinkSync(file.path);
                }
                catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error submitting daily log',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get all daily logs
router.get('/', (req, res) => {
    const logs = dailyLogs
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .map(log => ({
        id: log.id,
        submissionId: log.submissionId,
        reportDate: log.reportDate,
        shiftPeriod: log.shiftPeriod,
        officerName: log.officerName,
        summary: log.summary,
        submittedAt: log.submittedAt,
        submittedBy: log.submittedBy
    }));
    res.json({
        success: true,
        dailyLogs: logs,
        total: logs.length
    });
});
// Get daily log by ID
router.get('/:id', (req, res) => {
    const log = dailyLogs.find(l => l.id === parseInt(req.params.id));
    if (!log) {
        return res.status(404).json({
            success: false,
            message: 'Daily log not found'
        });
    }
    res.json({
        success: true,
        dailyLog: log
    });
});
// Get daily log by submission ID
router.get('/submission/:submissionId', (req, res) => {
    const log = dailyLogs.find(l => l.submissionId === req.params.submissionId);
    if (!log) {
        return res.status(404).json({
            success: false,
            message: 'Daily log not found'
        });
    }
    res.json({
        success: true,
        dailyLog: log
    });
});
// Download attachment file
router.get('/attachment/:submissionId/:filename', (req, res) => {
    const { submissionId, filename } = req.params;
    const log = dailyLogs.find(l => l.submissionId === submissionId);
    if (!log) {
        return res.status(404).json({
            success: false,
            message: 'Daily log not found'
        });
    }
    const attachment = log.attachments.find((att) => att.filename === filename);
    if (!attachment) {
        return res.status(404).json({
            success: false,
            message: 'Attachment not found'
        });
    }
    const filePath = attachment.uploadPath;
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'File not found on disk'
        });
    }
    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimetype);
    res.sendFile(path_1.default.resolve(filePath));
});
// Delete daily log (admin only)
router.delete('/:id', async (req, res) => {
    const logIndex = dailyLogs.findIndex(l => l.id === parseInt(req.params.id));
    if (logIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Daily log not found'
        });
    }
    const log = dailyLogs[logIndex];
    // Delete associated files
    if (log.attachments && log.attachments.length > 0) {
        log.attachments.forEach((attachment) => {
            try {
                if (fs_1.default.existsSync(attachment.uploadPath)) {
                    fs_1.default.unlinkSync(attachment.uploadPath);
                }
            }
            catch (error) {
                console.error('Error deleting file:', error);
            }
        });
    }
    // Remove from memory
    dailyLogs.splice(logIndex, 1);
    res.json({
        success: true,
        message: 'Daily log deleted successfully'
    });
});
// Get daily logs summary/statistics
router.get('/stats/summary', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const todayLogs = dailyLogs.filter(log => log.reportDate === today);
    const thisWeekLogs = dailyLogs.filter(log => new Date(log.reportDate) >= thisWeek);
    const totalVendors = dailyLogs.reduce((sum, log) => sum + log.summary.totalVendors, 0);
    const totalGuests = dailyLogs.reduce((sum, log) => sum + log.summary.totalGuests, 0);
    const totalPackages = dailyLogs.reduce((sum, log) => sum + log.summary.totalPackages, 0);
    const totalEquipmentIssues = dailyLogs.reduce((sum, log) => sum + log.summary.equipmentIssues, 0);
    res.json({
        success: true,
        summary: {
            totalDailyLogs: dailyLogs.length,
            todayLogs: todayLogs.length,
            thisWeekLogs: thisWeekLogs.length,
            totalVendors,
            totalGuests,
            totalPackages,
            totalEquipmentIssues,
            averagePatrolRounds: dailyLogs.length > 0
                ? (dailyLogs.reduce((sum, log) => sum + log.summary.patrolRoundsCompleted, 0) / dailyLogs.length).toFixed(1)
                : 0
        }
    });
});
exports.default = router;
//# sourceMappingURL=daily-logs.js.map