<!DOCTYPE html>
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

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #0D1B2A;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #E1E5EA;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .executive-summary {
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #E1E5EA;
            margin-bottom: 30px;
            position: relative;
        }

        .executive-summary::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, #3A86FF, #0D1B2A);
            border-radius: 0 2px 2px 0;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #e8f5e8;
            color: #0d5016;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }

        .content-text {
            line-height: 1.7;
            margin-bottom: 15px;
        }

        .timestamp-log {
            background: #fafafa;
            padding: 20px;
            border-radius: 6px;
            border-left: 3px solid #3A86FF;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.8;
            white-space: pre-wrap;
        }

        .recommendations {
            background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #fed7aa;
        }

        .recommendations ul {
            list-style: none;
            padding-left: 0;
        }

        .recommendations li {
            padding: 8px 0;
            border-bottom: 1px solid #fed7aa;
            position: relative;
            padding-left: 20px;
        }

        .recommendations li::before {
            content: "▸";
            color: #ea580c;
            font-weight: bold;
            position: absolute;
            left: 0;
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

        @media print {
            body { margin: 0; }
            .page { margin: 0; box-shadow: none; }
        }
    </style>
</head>
<body>
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
            <div>Generated: <span id="currentDateTime"></span></div>
            <div>Page 1 of 3</div>
        </div>
    </div>

    <div class="page">
        <div class="report-title">
            <h2>Security Operations Report</h2>
            <div class="report-subtitle">Executive Protection Daily Summary</div>
        </div>

        <div class="meta-info">
            <div>
                <div class="meta-item">
                    <span class="meta-label">Client</span>
                    <span class="meta-value">Bankteller</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Report Date</span>
                    <span class="meta-value">May 31, 2025</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Report Type</span>
                    <span class="meta-value">Daily Summary</span>
                </div>
            </div>
            <div>
                <div class="meta-item">
                    <span class="meta-label">Security Level</span>
                    <span class="meta-value">Executive Protection</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Lead Agent</span>
                    <span class="meta-value">Agent Ramirez</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Status</span>
                    <span class="meta-value">✅ Operational</span>
                </div>
            </div>
        </div>

        <div class="executive-summary">
            <div class="status-indicator">
                <div class="status-dot"></div>
                Security Status: Operational
            </div>
            <div class="section-title">Executive Summary</div>
            <div class="content-text">
                This report provides a comprehensive review of security operations for client Bankteller on May 31, 2025. The day was marked by routine patrols, hourly checks, and personnel changes. However, a significant security concern was identified during a patrol conducted by Agent Troy Ramirez at 0725 hours. The North-Side gate was found propped open with a trash can. All other checks and patrols reported no discrepancies, and all security equipment was operational throughout the day.
            </div>
        </div>

        <div class="section">
            <div class="section-title">Detailed Security Log</div>
            <div class="content-text">
                The security log for the day was initiated at 0600 hours with the changeover from the night shift to the day shift. The day shift was manned by Agents Marcus Bell and Troy Ramirez, while the night shift was handled by Agents Daniela Knox and Eli Sutton.
            </div>
            <div class="content-text">
                Throughout the day, routine patrols were conducted by the agents, with no discrepancies observed except for the aforementioned security concern at 0725 hours. The perimeter was found secure during all patrols.
            </div>
            <div class="timestamp-log">0600: Day shift changeover - Agents Bell and Ramirez on duty
0725: SECURITY CONCERN - North gate found propped open with trash can
0730: North gate secured, trash can removed, perimeter check completed
0900: Hourly perimeter patrol - All clear
1000: Equipment check - All systems operational
1200: Client departure for lunch meeting
1215: Escort detail activated for client transport
1400: Client return, premises secured
1500: Afternoon patrol cycle initiated
1800: Evening shift preparation
2000: Day shift concluded</div>
        </div>

        <div class="section">
            <div class="section-title">Security Assessment & Recommendations</div>
            <div class="recommendations">
                <ul>
                    <li>Investigate North-Side gate incident - Review overnight surveillance footage</li>
                    <li>Implement additional gate sensors with immediate alert capabilities</li>
                    <li>Increase patrol frequency during shift changeover periods</li>
                    <li>Conduct security briefing with all personnel regarding gate protocols</li>
                    <li>Consider upgrading gate locking mechanism to prevent unauthorized propping</li>
                </ul>
            </div>
        </div>

        <div class="digital-signature">
            <div style="font-weight: 600; margin-bottom: 10px; color: #0D1B2A;">DOCUMENT AUTHENTICATION</div>
            <div class="signature-line">
                <span>Report Generated:</span>
                <span id="generationTime"></span>
            </div>
            <div class="signature-line">
                <span>Generated by:</span>
                <span>VeriVault AI Security Management System</span>
            </div>
            <div class="signature-line">
                <span>Report ID:</span>
                <span class="report-id">VV-20250531-EP-001</span>
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

    <script>
        // Set current date/time
        const now = new Date();
        document.getElementById('currentDateTime').textContent = now.toLocaleString();
        document.getElementById('generationTime').textContent = now.toLocaleString();
    </script>
</body>
</html>
