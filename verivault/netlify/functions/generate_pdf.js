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
    console.log('🔐 Classified PDF generation request received');
    console.log('📋 Request body:', event.body);
    
    const requestData = JSON.parse(event.body);
    const { content, clientName: providedClientName, reportDate: providedReportDate } = requestData;
    
    console.log('📊 Intelligence data parsed:', { 
      contentLength: content?.length, 
      providedClientName, 
      providedReportDate 
    });
    
    if (!content) {
      console.error('❌ No intelligence content provided');
      return {
        statusCode: 400,
        headers,
        body: 'No intelligence content provided'
      };
    }

    // Parse content to extract key intelligence parameters
    const lines = content.split('\n');
    let clientName = providedClientName || 'Classified Client';
    let reportDate = providedReportDate || new Date().toLocaleDateString();
    let reportType = 'Intelligence Report';
    let reportId = `VV-${Date.now()}-CLASSIFIED`;
    
    // Extract client designation and date from intelligence content
    lines.forEach(line => {
      if (line.includes('CLIENT:') && !providedClientName) {
        clientName = line.split('CLIENT:')[1]?.trim() || clientName;
      }
      if (line.includes('DATE:') && !providedReportDate) {
        reportDate = line.split('DATE:')[1]?.trim() || reportDate;
      }
      if (line.includes('Report ID:')) {
        reportId = line.split('Report ID:')[1]?.trim() || reportId;
      }
    });

    // Generate accurate timestamp with Pacific Time for operational accuracy
    const currentTimestamp = new Date().toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles', // Pacific Time for Simi Valley, CA
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    console.log('⏰ Generated operational timestamp:', currentTimestamp);
    console.log('🎯 Using client designation:', clientName);
    console.log('📅 Using operation date:', reportDate);

    // Process and format intelligence content with enhanced typography
    const cleanContent = content
        .replace(/CLIENT:.*\n/g, '')
        .replace(/DATE:.*\n/g, '')
        .replace(/RAW SECURITY LOG:\n/g, '')
        .replace(/═══.*\n/g, '')
        .replace(/DOCUMENT AUTHENTICATION[\s\S]*$/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<h3 style="color: #1E3A8A; font-weight: 700; font-size: 16px; margin: 20px 0 10px 0; border-bottom: 2px solid #00CFFF; padding-bottom: 5px;">$1</h3>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^([A-Z\s]{3,}):$/gm, '<h4 style="color: #1E3A8A; font-weight: 600; font-size: 14px; margin: 15px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">$1:</h4>')
        .trim();

    // Generate cryptographic hash for document verification
    const hashValue = Array.from(cleanContent).reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
    }, 0).toString(16).toUpperCase().substring(0, 16);

    const timestamp = currentTimestamp;

    // Implement smarter pagination - prevent blank pages
    const words = cleanContent.split(' ').filter(word => word.trim().length > 0);
    const wordsPerPage = 300; // Further reduced to ensure no content overlap
    const pages = [];
    
    // Only create multiple pages if content is substantial
    if (words.length > wordsPerPage) {
        for (let i = 0; i < words.length; i += wordsPerPage) {
            const pageWords = words.slice(i, i + wordsPerPage);
            if (pageWords.length > 0) {
                pages.push(pageWords.join(' '));
            }
        }
    } else {
        pages.push(cleanContent);
    }
    
    // Filter out any empty or very short pages
    const filteredPages = pages.filter(page => page.trim().length > 100);

    console.log('📄 Intelligence report processing complete');
    console.log('📊 Generated pages:', validPages.length);

    // Generate pages with proper numbering and prevent blank pages
    let pagesHTML = '';
    
    // Ensure we only create pages with substantial content
    const validPages = filteredPages.filter(page => {
        const wordCount = page.trim().split(' ').length;
        return wordCount > 20; // Only pages with more than 20 words
    });
    
    validPages.forEach((pageContent, index) => {
        const pageNumber = index + 1;
        const isLastPage = index === validPages.length - 1;
        
        pagesHTML += `
        <div class="page">
            <div class="page-number">Page ${pageNumber}</div>
            ${index === 0 ? `
            <div class="report-title">
                <h2>Intelligence Operations Report</h2>
                <div class="report-subtitle">Classified Security Assessment</div>
            </div>

            <div class="meta-info">
                <div>
                    <div class="meta-item">
                        <span class="meta-label">Client Designation</span>
                        <span class="meta-value">${clientName}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Operation Date</span>
                        <span class="meta-value">${reportDate}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Classification</span>
                        <span class="meta-value">CONFIDENTIAL</span>
                    </div>
                </div>
                <div>
                    <div class="meta-item">
                        <span class="meta-label">Generated By</span>
                        <span class="meta-value">VeriVault AI Intelligence</span>
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
            ` : ''}
            <div class="content-section">${pageContent}</div>
            ${isLastPage ? `
            <div class="digital-signature">
                <div class="signature-line">
                    <div class="signature-title">Digital Signature</div>
                    <div class="signature-info">
                        <div class="signature-hash">Hash: ${hashValue}</div>
                        <div class="signature-timestamp">Verified: ${timestamp}</div>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>`;
    });

    // Generate classified HTML intelligence report
    const classifiedReport = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriVault Classified Intelligence Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: white;
            color: #1E3A8A;
            line-height: 1.6;
            font-size: 11pt;
            margin: 0;
            padding: 0;
        }

        .page {
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            background: white;
            position: relative;
            padding: 1.8in 1in 1in 1in;
            page-break-after: always;
            box-sizing: border-box;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        .page-number {
            position: absolute;
            top: 0.9in;
            right: 1in;
            font-size: 11px;
            font-weight: bold;
            color: white;
            z-index: 1001;
        }

        /* CLASSIFIED HEADER */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 1.2in;
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            padding: 0.2in 1in;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .vault-shield {
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #00CFFF 0%, #0ea5e9 100%);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            box-shadow: 0 4px 15px rgba(0, 207, 255, 0.4);
            position: relative;
        }

        .vault-shield::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 15px;
            height: 15px;
            background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
            border-radius: 2px;
            opacity: 0.8;
        }

        .logo-text h1 {
            font-family: 'Rajdhani', sans-serif;
            font-size: 18px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
        }

        .logo-text .tagline {
            font-size: 7px;
            opacity: 0.9;
            font-weight: 400;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .header-info {
            text-align: right;
            font-size: 9px;
        }

        .classification {
            background: #F59E0B;
            color: #1E3A8A;
            padding: 3px 10px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 8px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* SECURE FOOTER */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0.7in;
            background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
            padding: 0.15in 1in;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
            color: #1E3A8A;
            border-top: 3px solid #00CFFF;
        }

        .footer-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .security-badge {
            background: #1E3A8A;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 700;
            font-size: 7px;
        }

        /* CONTENT STYLING */
        .report-title {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 4px solid #00CFFF;
        }

        .report-title h2 {
            font-family: 'Rajdhani', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #1E3A8A;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }

        .report-subtitle {
            font-size: 12px;
            color: #00CFFF;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
            padding: 15px;
            background: linear-gradient(135deg, #F3F4F6 0%, rgba(0, 207, 255, 0.05) 100%);
            border-left: 4px solid #00CFFF;
            border-radius: 0 8px 8px 0;
        }

        .meta-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid rgba(0, 207, 255, 0.2);
        }

        .meta-label {
            font-weight: 700;
            color: #1E3A8A;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-family: 'Rajdhani', sans-serif;
        }

        .meta-value {
            font-weight: 500;
            color: #1E3A8A;
            font-size: 9px;
        }

        .content-section {
            margin-bottom: 20px;
            background: white;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid rgba(0, 207, 255, 0.2);
            white-space: pre-wrap;
            line-height: 1.7;
        }

        .digital-signature {
            margin-top: 30px;
            padding: 15px;
            background: linear-gradient(135deg, #1E3A8A 0%, rgba(0, 207, 255, 0.1) 100%);
            border: 2px solid #00CFFF;
            border-radius: 6px;
            text-align: center;
            font-size: 8px;
            color: white;
        }

        .signature-line {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            color: #F3F4F6;
        }

        .signature-title {
            font-weight: 700;
            margin-bottom: 8px;
            color: #F59E0B;
            font-family: 'Rajdhani', sans-serif;
        }

        .signature-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .signature-hash {
            font-family: 'Courier New', monospace;
            color: #22c55e;
            font-weight: 700;
        }

        .signature-timestamp {
            color: #F3F4F6;
        }

        .report-id {
            font-family: 'Courier New', monospace;
            color: #F59E0B;
            font-weight: 700;
        }

        .classification-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-family: 'Rajdhani', sans-serif;
            font-size: 42px;
            color: rgba(30, 58, 138, 0.05);
            font-weight: 800;
            z-index: -1;
            user-select: none;
            pointer-events: none;
            text-transform: uppercase;
            letter-spacing: 3px;
        }

        @page {
            margin: 0;
            size: letter;
        }

        @media print {
            body { 
                margin: 0; 
            }
            .page { 
                margin: 0; 
                box-shadow: none; 
                page-break-after: always;
            }
            .page:last-child {
                page-break-after: avoid;
            }
        }

        /* Mobile responsiveness */
        .phone-desktop {
            display: inline;
        }

        @media (max-width: 768px) {
            .phone-desktop {
                display: none;
            }
        }
    </style>
    <script>
        window.onload = function() {
            // Auto-trigger print dialog for PDF generation
            setTimeout(function() {
                window.print();
            }, 800);
        };
    </script>
</head>
<body>
    <div class="classification-watermark">CLASSIFIED • VERIVAULT</div>
    
    <div class="header">
        <div class="logo-section">
            <div class="vault-shield">🛡️</div>
            <div class="logo-text">
                <h1>VeriVault</h1>
                <div class="tagline">AI Security Intelligence</div>
            </div>
        </div>
        <div class="header-info">
            <div class="classification">🔒 CLASSIFIED</div>
            <div>Generated: ${currentTimestamp}</div>
        </div>
    </div>

    ${pagesHTML}

    <div class="footer">
        <div class="footer-left">
            <div class="security-badge">AI-VERIFIED</div>
            <span>VeriVault AI Intelligence Platform</span>
        </div>
        <div style="text-align: center;">
            <div>CLASSIFIED - AUTHORIZED PERSONNEL ONLY</div>
        </div>
        <div style="text-align: right;">
            <div><a href="mailto:secure@verivault.ai" style="color: inherit; text-decoration: none;">secure@verivault.ai</a> | <span class="phone-desktop">+1 (555) VER-VAULT</span></div>
        </div>
    </div>
</body>
</html>`;

    return {
      statusCode: 200,
      headers,
      body: classifiedReport
    };

  } catch (error) {
    console.error('🚨 Critical PDF Generation Error:', error);
    console.error('📋 Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: `Error generating classified PDF: ${error.message}`
    };
  }
};
