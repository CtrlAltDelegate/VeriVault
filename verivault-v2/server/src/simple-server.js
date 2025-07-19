const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let logs = [];
let logIdCounter = 1;

// In-memory user storage with PIN codes
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'password',
    role: 'administrator',
    pin: '1234', // 4-digit PIN
    pinHash: crypto.createHash('sha256').update('1234').digest('hex')
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VeriVault Server is running' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role },
      token: 'demo-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// PIN verification endpoint
app.post('/api/auth/verify-pin', (req, res) => {
  const { userId, pin } = req.body;
  
  if (!userId || !pin) {
    return res.status(400).json({
      success: false,
      message: 'User ID and PIN are required'
    });
  }
  
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Verify PIN
  if (user.pin === pin) {
    // Generate verification hash for watermarking
    const verificationHash = crypto.createHash('sha256')
      .update(`${user.id}-${pin}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16);
    
    res.json({
      success: true,
      message: 'PIN verified successfully',
      verificationData: {
        userHash: user.pinHash.substring(0, 8),
        timestamp: new Date().toISOString(),
        verificationHash: verificationHash
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid PIN'
    });
  }
});

// Log routes
app.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  });
});

app.post('/api/logs', (req, res) => {
  const { category, timestamp, location, subject, action, priority, notes } = req.body;
  
  const newLog = {
    id: logIdCounter++,
    category,
    timestamp: timestamp || new Date().toISOString(),
    location,
    subject,
    action,
    priority: priority || 'low',
    notes,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  };
  
  logs.push(newLog);
  
  res.status(201).json({
    success: true,
    message: 'Log entry created successfully',
    log: newLog
  });
});

// Reports routes
app.post('/api/reports/generate', (req, res) => {
  const { csvData, clientName, reportDate, reportType } = req.body;
  
  res.json({
    success: true,
    message: 'Report generation started',
    reportId: Date.now().toString()
  });
});

// Generate report with watermark endpoint
app.post('/api/reports/generate-with-watermark', (req, res) => {
  const { reportType, reportData, verificationData } = req.body;
  
  if (!reportType || !verificationData) {
    return res.status(400).json({
      success: false,
      message: 'Report type and verification data are required'
    });
  }

  try {
    // Generate submission ID
    const submissionId = `VV-${Date.now().toString(36).toUpperCase()}`;
    
    // Create watermark data
    const watermarkData = {
      userHash: verificationData.userHash,
      timestamp: verificationData.timestamp,
      submissionId: submissionId,
      reportType: reportType,
      systemVersion: '2.0.0',
      reviewerId: null
    };

    // Generate watermark text (invisible footer)
    const watermarkText = `${watermarkData.userHash}|${watermarkData.timestamp}|${watermarkData.submissionId}|VV2.0`;
    
    // Create basic HTML for PDF generation (simplified for demo)
    const reportHtml = generateSimpleReportHTML(reportType, watermarkData, watermarkText);
    
    res.json({
      success: true,
      message: 'Report generated successfully with security watermark',
      submissionId: submissionId,
      watermarkApplied: true,
      pdfContent: reportHtml,
      reportMetadata: {
        type: reportType,
        generatedAt: new Date().toISOString(),
        watermarkHash: watermarkData.userHash,
        submissionId: submissionId
      }
    });

  } catch (error) {
    console.error('Error generating watermarked report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report with watermark'
    });
  }
});

// Helper function for simple HTML generation
function generateSimpleReportHTML(reportType, watermarkData, watermarkText) {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>VeriVault ${reportType} Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1E3A8A; }
        .header { background: #1E3A8A; color: white; padding: 20px; margin: -40px -40px 30px -40px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 14px; opacity: 0.9; }
        .meta { background: #f8f9fa; padding: 15px; border-left: 4px solid #00CFFF; margin: 20px 0; }
        .content { padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
        .verification { background: #22c55e; color: white; padding: 15px; text-align: center; margin: 20px 0; }
        .watermark { position: fixed; bottom: 10px; right: 40px; font-size: 8px; color: rgba(30, 58, 138, 0.15); font-family: monospace; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; background: #f3f4f6; padding: 10px 40px; border-top: 3px solid #00CFFF; font-size: 10px; }
        @media print { .footer { position: fixed; bottom: 0; } }
    </style>
    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); }, 800);
        };
    </script>
</head>
<body>
    <div class="header">
        <div class="title">🛡️ VeriVault ${reportType}</div>
        <div class="subtitle">PIN-Verified Security Report | Generated: ${currentDate} ${currentTime}</div>
    </div>
    
    <div class="meta">
        <strong>Report Information:</strong><br>
        Type: ${reportType}<br>
        Generated: ${currentDate} at ${currentTime}<br>
        Submission ID: ${watermarkData.submissionId}<br>
        Status: ✅ PIN Verified
    </div>
    
    <div class="content">
        <h3>Report Content</h3>
        <p>This ${reportType} has been generated and verified through PIN authentication.</p>
        <p>All security protocols have been followed and the report is ready for review.</p>
        <p><strong>Authentication Status:</strong> PIN Verified</p>
        <p><strong>Security Level:</strong> CONFIDENTIAL</p>
    </div>
    
    <div class="verification">
        <strong>PIN Authentication Verified</strong><br>
        Auth Hash: ${watermarkData.userHash} | Verified: ${watermarkData.timestamp}
    </div>
    
    <!-- INVISIBLE WATERMARK -->
    <div class="watermark">${watermarkText}</div>
    
    <div class="footer">
        <div style="display: flex; justify-content: space-between;">
            <span>🔐 PIN-VERIFIED | VeriVault AI Intelligence Platform</span>
            <span>CONFIDENTIAL - AUTHORIZED PERSONNEL ONLY</span>
            <span>secure@verivault.ai | +1 (555) VER-VAULT</span>
        </div>
    </div>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`🚀 VeriVault Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Demo PIN for user admin: 1234`);
  
  // TODO: Future Multi-LLM Review Pipeline Status
  console.log(`📋 Multi-LLM Review: Not yet implemented (Future Phase)`);
  console.log(`🤖 Planned LLMs: GPT-4o + Claude 3 + Command R+ for consensus review`);
}); 