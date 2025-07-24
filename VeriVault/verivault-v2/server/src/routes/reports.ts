import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 20 // Maximum 20 files per submission
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mov', 'video/avi', 'video/quicktime',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// In-memory storage for reports (replace with database)
let reports: any[] = [];
let reportIdCounter = 1;

// Generate report with PIN verification
router.post('/generate', upload.array('attachments'), async (req: Request, res: Response) => {
  try {
    const { reportType, formData, verificationData } = req.body;
    const parsedFormData = JSON.parse(formData);
    const parsedVerificationData = JSON.parse(verificationData);
    
    // Verify PIN (simplified - in production, verify against user database)
    if (!parsedVerificationData.pin || parsedVerificationData.pin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN format'
      });
    }
    
    // Process uploaded files
    const files = req.files as Express.Multer.File[];
    const attachments = files ? files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadPath: file.path
    })) : [];
    
    // Generate submission ID
    const submissionId = `RPT-${reportIdCounter.toString().padStart(6, '0')}`;
    const timestamp = new Date().toISOString();
    
    // Create report record
    const reportRecord = {
      id: reportIdCounter++,
      submissionId,
      reportType,
      formData: parsedFormData,
      verificationData: {
        username: parsedVerificationData.username,
        timestamp: parsedVerificationData.timestamp,
        pinVerified: true
      },
      attachments,
      status: 'generated',
      createdAt: timestamp,
      generatedBy: parsedVerificationData.username
    };
    
    reports.push(reportRecord);
    
    // Generate PDF content based on report type
    let pdfContent = '';
    
    if (reportType === 'medical_incident') {
      pdfContent = generateMedicalIncidentPDF(parsedFormData, parsedVerificationData, submissionId, attachments);
    } else if (reportType === 'non_medical_incident') {
      pdfContent = generateNonMedicalIncidentPDF(parsedFormData, parsedVerificationData, submissionId, attachments);
    } else if (reportType === 'security_audit') {
      pdfContent = generateSecurityAuditPDF(parsedFormData, parsedVerificationData, submissionId, attachments);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${submissionId}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Return the PDF content (in a real implementation, you'd use a PDF library like PDFKit)
    res.send(Buffer.from(pdfContent, 'utf8'));
    
  } catch (error) {
    console.error('Error generating report:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to generate Medical Incident PDF
function generateMedicalIncidentPDF(formData: any, verificationData: any, submissionId: string, attachments: any[]): string {
  const timestamp = new Date().toISOString();
  const watermark = `VERIFIED - PIN AUTHENTICATED - ${verificationData.username.toUpperCase()} - ${timestamp}`;
  
  return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 12 Tf
72 720 Td
(MEDICAL INCIDENT REPORT) Tj
0 -20 Td
(${watermark}) Tj
0 -20 Td
(Report ID: ${submissionId}) Tj
0 -20 Td
(Generated: ${timestamp}) Tj
0 -40 Td
(INJURED PERSON INFORMATION) Tj
0 -20 Td
(Name: ${formData.injuredPersonInfo.firstName} ${formData.injuredPersonInfo.lastName}) Tj
0 -15 Td
(Employee ID: ${formData.injuredPersonInfo.employeeId || 'N/A'}) Tj
0 -15 Td
(Department: ${formData.injuredPersonInfo.department || 'N/A'}) Tj
0 -15 Td
(Job Title: ${formData.injuredPersonInfo.jobTitle || 'N/A'}) Tj
0 -30 Td
(INCIDENT DETAILS) Tj
0 -20 Td
(Date: ${formData.incidentDetails.date}) Tj
0 -15 Td
(Time: ${formData.incidentDetails.time}) Tj
0 -15 Td
(Location: ${formData.incidentDetails.location}) Tj
0 -15 Td
(Exact Location: ${formData.incidentDetails.exactLocation || 'N/A'}) Tj
0 -30 Td
(INJURY DETAILS) Tj
0 -20 Td
(Body Part: ${formData.injuryDetails.bodyPart || 'N/A'}) Tj
0 -15 Td
(Injury Type: ${formData.injuryDetails.injuryType || 'N/A'}) Tj
0 -15 Td
(Severity: ${formData.injuryDetails.severity}) Tj
0 -15 Td
(Description: ${formData.injuryDetails.description}) Tj
0 -30 Td
(ACTIONS TAKEN) Tj
0 -20 Td
(First Aid: ${formData.actionsTaken.firstAid ? 'Yes' : 'No'}) Tj
0 -15 Td
(Medical Attention: ${formData.actionsTaken.medicalAttention ? 'Yes' : 'No'}) Tj
0 -15 Td
(Hospital Transport: ${formData.actionsTaken.hospitalTransport ? 'Yes' : 'No'}) Tj
0 -15 Td
(Description: ${formData.actionsTaken.description || 'N/A'}) Tj
0 -30 Td
(RESOLUTION) Tj
0 -20 Td
(Current Status: ${formData.resolution.currentStatus || 'N/A'}) Tj
0 -15 Td
(Expected Return: ${formData.resolution.expectedReturn || 'N/A'}) Tj
0 -15 Td
(Additional Notes: ${formData.resolution.additionalNotes || 'N/A'}) Tj
0 -30 Td
(ATTACHMENTS: ${attachments.length} file(s) uploaded) Tj
0 -30 Td
(This document has been digitally verified and timestamped.) Tj
0 -15 Td
(Report generated by VeriVault Security System) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000002321 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
2409
%%EOF`;
}

// Helper function to generate Non-Medical Incident PDF
function generateNonMedicalIncidentPDF(formData: any, verificationData: any, submissionId: string, attachments: any[]): string {
  const timestamp = new Date().toISOString();
  const watermark = `VERIFIED - PIN AUTHENTICATED - ${verificationData.username.toUpperCase()} - ${timestamp}`;
  
  return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 1800
>>
stream
BT
/F1 12 Tf
72 720 Td
(NON-MEDICAL INCIDENT REPORT) Tj
0 -20 Td
(${watermark}) Tj
0 -20 Td
(Report ID: ${submissionId}) Tj
0 -20 Td
(Generated: ${timestamp}) Tj
0 -40 Td
(INCIDENT DETAILS) Tj
0 -20 Td
(Type: ${formData.incidentDetails.type.replace('_', ' ').toUpperCase()}) Tj
0 -15 Td
(Date: ${formData.incidentDetails.date}) Tj
0 -15 Td
(Time: ${formData.incidentDetails.time}) Tj
0 -15 Td
(Location: ${formData.incidentDetails.location}) Tj
0 -15 Td
(Severity: ${formData.incidentDetails.severity.toUpperCase()}) Tj
0 -15 Td
(Description: ${formData.incidentDetails.description}) Tj
0 -30 Td
(PERSONS INVOLVED) Tj
${formData.personsInvolved.map((person: any, index: number) => `
0 -20 Td
(Person ${index + 1}: ${person.name || 'N/A'}) Tj
0 -15 Td
(Role: ${person.role || 'N/A'}) Tj
0 -15 Td
(Department/Company: ${person.department || 'N/A'}) Tj
0 -15 Td
(Involvement: ${person.involvement || 'N/A'}) Tj`).join('')}
0 -30 Td
(SYSTEMS AFFECTED) Tj
0 -20 Td
(Security: ${formData.systemsAffected.security ? 'Yes' : 'No'}) Tj
0 -15 Td
(Network/IT: ${formData.systemsAffected.network ? 'Yes' : 'No'}) Tj
0 -15 Td
(Equipment: ${formData.systemsAffected.equipment ? 'Yes' : 'No'}) Tj
0 -15 Td
(Facility: ${formData.systemsAffected.facility ? 'Yes' : 'No'}) Tj
0 -15 Td
(Impact Description: ${formData.systemsAffected.description || 'N/A'}) Tj
0 -30 Td
(CORRECTIVE ACTIONS) Tj
0 -20 Td
(Immediate Actions: ${formData.correctiveActions.immediateActions || 'N/A'}) Tj
0 -15 Td
(Preventive Measures: ${formData.correctiveActions.preventiveMeasures || 'N/A'}) Tj
0 -15 Td
(Responsible Person: ${formData.correctiveActions.responsiblePerson || 'N/A'}) Tj
0 -15 Td
(Target Completion: ${formData.correctiveActions.completionDate || 'N/A'}) Tj
0 -30 Td
(ATTACHMENTS: ${attachments.length} file(s) uploaded) Tj
0 -30 Td
(This document has been digitally verified and timestamped.) Tj
0 -15 Td
(Report generated by VeriVault Security System) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000002121 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
2209
%%EOF`;
}

// Helper function to generate Security Audit PDF
function generateSecurityAuditPDF(formData: any, verificationData: any, submissionId: string, attachments: any[]): string {
  const timestamp = new Date().toISOString();
  const watermark = `VERIFIED - PIN AUTHENTICATED - ${verificationData.username.toUpperCase()} - ${timestamp}`;
  
  return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 2200
>>
stream
BT
/F1 12 Tf
72 720 Td
(SECURITY SYSTEMS AUDIT REPORT) Tj
0 -20 Td
(${watermark}) Tj
0 -20 Td
(Report ID: ${submissionId}) Tj
0 -20 Td
(Generated: ${timestamp}) Tj
0 -40 Td
(AUDIT INFORMATION) Tj
0 -20 Td
(Date: ${formData.auditDetails.date}) Tj
0 -15 Td
(Time: ${formData.auditDetails.time}) Tj
0 -15 Td
(Audited By: ${formData.auditDetails.auditedBy}) Tj
0 -15 Td
(Audit Type: ${formData.auditDetails.auditType.replace('_', ' ').toUpperCase()}) Tj
0 -30 Td
(CAMERA SYSTEMS) Tj
0 -20 Td
(Total Count: ${formData.cameras.totalCount || 'N/A'}) Tj
0 -15 Td
(Operational: ${formData.cameras.operational || 'N/A'}) Tj
0 -15 Td
(Coverage Quality: ${formData.cameras.coverage || 'N/A'}) Tj
0 -15 Td
(Recording Quality: ${formData.cameras.recordingQuality || 'N/A'}) Tj
0 -15 Td
(Notes: ${formData.cameras.notes || 'N/A'}) Tj
0 -30 Td
(BEAM/MOTION DETECTION SYSTEMS) Tj
0 -20 Td
(Total Count: ${formData.beams.totalCount || 'N/A'}) Tj
0 -15 Td
(Operational: ${formData.beams.operational || 'N/A'}) Tj
0 -15 Td
(Sensitivity: ${formData.beams.sensitivity || 'N/A'}) Tj
0 -15 Td
(Coverage: ${formData.beams.coverage || 'N/A'}) Tj
0 -15 Td
(Notes: ${formData.beams.notes || 'N/A'}) Tj
0 -30 Td
(EMERGENCY EQUIPMENT) Tj
0 -20 Td
(Alarms - Count: ${formData.emergencyEquipment.alarms.count || 'N/A'}, Operational: ${formData.emergencyEquipment.alarms.operational || 'N/A'}) Tj
0 -15 Td
(Exits - Count: ${formData.emergencyEquipment.exits.count || 'N/A'}, Operational: ${formData.emergencyEquipment.exits.operational || 'N/A'}) Tj
0 -15 Td
(Lighting - Count: ${formData.emergencyEquipment.lighting.count || 'N/A'}, Operational: ${formData.emergencyEquipment.lighting.operational || 'N/A'}) Tj
0 -30 Td
(DISCREPANCIES) Tj
${formData.discrepancies.map((disc: any, index: number) => `
0 -20 Td
(Issue ${index + 1} - System: ${disc.system || 'N/A'}) Tj
0 -15 Td
(Severity: ${disc.severity || 'N/A'}) Tj
0 -15 Td
(Description: ${disc.issue || 'N/A'}) Tj
0 -15 Td
(Recommended Action: ${disc.action || 'N/A'}) Tj
0 -15 Td
(Flagged: ${disc.flagged ? 'Yes' : 'No'}) Tj`).join('')}
0 -30 Td
(OTHER NOTES) Tj
0 -20 Td
(General Observations: ${formData.otherNotes.generalObservations || 'N/A'}) Tj
0 -15 Td
(Recommendations: ${formData.otherNotes.recommendations || 'N/A'}) Tj
0 -15 Td
(Next Audit Date: ${formData.otherNotes.nextAuditDate || 'N/A'}) Tj
0 -30 Td
(ATTACHMENTS: ${attachments.length} file(s) uploaded) Tj
0 -30 Td
(This document has been digitally verified and timestamped.) Tj
0 -15 Td
(Report generated by VeriVault Security System) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000002521 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
2609
%%EOF`;
}

// Get all reports
router.get('/', (req: Request, res: Response) => {
  const { status, reportType, limit, offset } = req.query;
  
  let filteredReports = [...reports];
  
  // Filter by status
  if (status && status !== 'all') {
    filteredReports = filteredReports.filter(report => report.status === status);
  }
  
  // Filter by report type
  if (reportType && reportType !== 'all') {
    filteredReports = filteredReports.filter(report => report.reportType === reportType);
  }
  
  // Sort by creation date (newest first)
  filteredReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Pagination
  const limitNum = parseInt((limit as string) || '50');
  const offsetNum = parseInt((offset as string) || '0');
  const paginatedReports = filteredReports.slice(offsetNum, offsetNum + limitNum);
  
  res.json({
    success: true,
    reports: paginatedReports,
    total: filteredReports.length,
    limit: limitNum,
    offset: offsetNum
  });
});

// Get report by submission ID
router.get('/:submissionId', (req: Request, res: Response) => {
  const report = reports.find(r => r.submissionId === req.params.submissionId);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }
  
  res.json({
    success: true,
    report: report
  });
});

// Download attachment
router.get('/attachment/:submissionId/:filename', (req: Request, res: Response) => {
  const { submissionId, filename } = req.params;
  
  const report = reports.find(r => r.submissionId === submissionId);
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }
  
  const attachment = report.attachments.find((att: any) => att.filename === filename);
  if (!attachment) {
    return res.status(404).json({
      success: false,
      message: 'Attachment not found'
    });
  }
  
  const filePath = attachment.uploadPath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found on disk'
    });
  }
  
  res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
  res.setHeader('Content-Type', attachment.mimetype);
  res.sendFile(path.resolve(filePath));
});

// Get report statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const todayReports = reports.filter(report => report.createdAt.startsWith(today));
  
  const stats = {
    total: reports.length,
    today: todayReports.length,
    medical: reports.filter(r => r.reportType === 'medical_incident').length,
    nonMedical: reports.filter(r => r.reportType === 'non_medical_incident').length,
    audit: reports.filter(r => r.reportType === 'security_audit').length,
    byStatus: {
      generated: reports.filter(r => r.status === 'generated').length,
      pending: reports.filter(r => r.status === 'pending').length,
      reviewed: reports.filter(r => r.status === 'reviewed').length
    }
  };
  
  res.json({
    success: true,
    stats: stats
  });
});

export default router; 