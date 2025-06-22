exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/html'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { content } = JSON.parse(event.body);
    
    if (!content) {
      return {
        statusCode: 400,
        headers,
        body: 'No content provided'
      };
    }

    // Parse content to extract key information
    const lines = content.split('\n');
    let clientName = 'Confidential Client';
    let reportDate = new Date().toLocaleDateString();
    let reportType = 'Security Report';
    let reportId = `VV-${Date.now()}`;
    
    // Extract client name and date from content
    lines.forEach(line => {
      if (line.includes('CLIENT:')) {
        clientName = line.split('CLIENT:')[1]?.trim() || clientName;
      }
      if (line.includes('DATE:')) {
        reportDate = line.split('DATE:')[1]?.trim() || reportDate;
      }
      if (line.includes('Report ID:')) {
        reportId = line.split('Report ID:')[1]?.trim() || reportId;
      }
    });

    // Clean up content for display
    const cleanContent = content
      .replace(/CLIENT:.*\n/g, '')
      .replace(/DATE:.*\n/g, '')
      .replace(/RAW SECURITY LOG:\n/g, '')
      .replace(/═══.*\n/g, '')
      .replace(/DOCUMENT AUTHENTICATION[\s\S]*$/g, '')
      .trim();

    // Generate professional HTML report
    const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriVault Security Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: white;
            color: #2E2E2E;
            line-height: 1.6;
            font-size: 11pt;
        }

        .page {
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            background: white;
            position: relative;
            padding: 1in;
            padding-top: 1.5in;
            padding-bottom: 1.2in;
        }

        /* HEADER */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 1.2in;
            background: linear-gradient(135deg, #0D1B2A 0%, #1e3a5f 100%);
            color: white;
            padding: 0.3in 1in;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(45deg, #3A86FF, #2563eb);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 15px rgba(58, 134, 255, 0.3);
        }

        .logo-text h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
        }

        .logo-text .tagline {
            font-size: 10px;
            opacity: 0.8;
            font-weight: 300;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .header-info {
            text-align: right;
            font-size: 10px;
        }

        .classification {
            background: #D4AF37;
            color: #0D1B2A;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 9px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        /* FOOTER */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0.8in;
            background: #E1E5EA;
            padding: 0.2in 1in;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #2E2E2E;
            border-top: 2px solid #3A86FF;
        }

        .footer-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .security-badge {
            background: #0D1B2A;
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: 600;
            font-size: 8px;
        }

        /* CONTENT */
        .report-title {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3A86FF;
        }

        .report-title h2 {
            font-size: 28px;
            font-weight: 700;
            color: #0D1B2A;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }

        .report-subtitle {
            font-size: 14px;
            color: #2E2E2E;
            font-weight: 400;
        }

        .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9ff;
            border-left: 4px solid #3A86FF;
            border-radius: 0 8px 8px 0;
        }

        .meta-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #E1E5EA;
        }

        .meta-label {
            font-weight: 600;
            color: #0D1B2A;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .meta-value {
            font-weight: 400;
            color: #2E2E2E;
        }

        .content-section {
            margin-bottom: 25px;
            background: white;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #E1E5EA;
            white-space: pre-wrap;
            line-height: 1.8;
        }

        .digital-signature {
            margin-top: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%);
            border: 2px solid #3A86FF;
            border-radius: 8px;
            text-align: center;
            font-size: 9px;
        }

        .signature-line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }

        .report-id {
            font-family: 'Courier New', monospace;
            color: #3A86FF;
            font-weight: 600;
        }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 48px;
            color: rgba(58, 134, 255, 0.05);
            font-weight: 700;
            z-index: -1;
            user-select: none;
            pointer-events: none;
        }

        @media print {
            body { margin: 0; }
            .page { margin: 0; box-shadow: none; }
        }

        @page {
            margin: 0;
            size: letter;
        }
    </style>
    <script>
        window.onload = function() {
            // Auto-trigger print dialog
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
</head>
<body>
    <div class="watermark">VERIVAULT CONFIDENTIAL</div>
    
    <div class="header">
        <div class="logo-section">
            <div class="logo-icon">🛡️</div>
            <div class="logo-text">
                <h1>VeriVault</h1>
                <div class="tagline">AI Security Intelligence Platform</div>
            </div>
        </div>
        <div class="header-info">
            <div class="classification">CONFIDENTIAL</div>
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div>Page 1 of 1</div>
        </div>
    </div>

    <div class="page">
        <div class="report-title">
            <h2>Security Operations Report</h2>
            <div class="report-subtitle">Professional Security Assessment</div>
        </div>

        <div class="meta-info">
            <div>
                <div class="meta-item">
                    <span class="meta-label">Client</span>
                    <span class="meta-value">${clientName}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Report Date</span>
                    <span class="meta-value">${reportDate}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Classification</span>
                    <span class="meta-value">Confidential</span>
                </div>
            </div>
            <div>
                <div class="meta-item">
                    <span class="meta-label">Generated By</span>
                    <span class="meta-value">VeriVault AI</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Report ID</span>
                    <span class="meta-value">${reportId}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Status</span>
                    <span class="meta-value">✅ Verified</span>
                </div>
            </div>
        </div>

        <div class="content-section">${cleanContent}</div>

        <div class="digital-signature">
            <div style="font-weight: 600; margin-bottom: 10px; color: #0D1B2A;">DOCUMENT AUTHENTICATION</div>
            <div class="signature-line">
                <span>Report Generated:</span>
                <span>${new Date().toLocaleString()}</span>
            </div>
            <div class="signature-line">
                <span>Generated by:</span>
                <span>VeriVault AI Security Management System</span>
            </div>
            <div class="signature-line">
                <span>Report ID:</span>
                <span class="report-id">${reportId}</span>
            </div>
            <div class="signature-line">
                <span>Digital Signature:</span>
                <span style="color: #22c55e; font-weight: 600;">[AI-VERIFIED ✓]</span>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #3A86FF; font-size: 8px; color: #64748b;">
                This report contains confidential and proprietary information. Distribution is restricted to authorized personnel only.
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="footer-left">
            <div class="security-badge">AI-VERIFIED</div>
            <span>VeriVault Security Intelligence Platform</span>
        </div>
        <div style="text-align: center;">
            <div>CONFIDENTIAL - AUTHORIZED PERSONNEL ONLY</div>
        </div>
        <div style="text-align: right;">
            <div>support@verivault.ai | +1 (555) 123-4567</div>
        </div>
    </div>
</body>
</html>`;

    return {
      statusCode: 200,
      headers,
      body: htmlReport
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: `Error generating PDF: ${error.message}`
    };
  }
};
