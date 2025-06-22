// .netlify/functions/analyze_csv.js
const https = require('https');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { csvData, clientName, reportDate, reportType } = JSON.parse(event.body);

        if (!csvData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'CSV data is required' })
            };
        }

        // Get OpenAI API key from environment variables
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.error('OpenAI API key not found in environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'AI service configuration error' })
            };
        }

        // Determine the analysis prompt based on report type
        const prompts = {
            'daily-log': `Analyze this security CSV data and create a comprehensive Daily Operations Log. Include:
- Executive summary of the day's activities
- Staff arrival/departure analysis
- Delivery and visitor summary
- Security incidents and observations
- Equipment status
- Recommendations for improvements

Format as a professional security report with clear sections and bullet points.`,

            'incident-medical': `Analyze this CSV data for medical incidents and create a Medical Incident Report. Focus on:
- Medical emergencies and injuries
- Response times and first aid provided
- Severity assessment
- Follow-up actions required
- Prevention recommendations

Format as a detailed medical incident analysis.`,

            'incident-non-medical': `Analyze this CSV data for security incidents and create a Security Incident Report. Include:
- Security breaches, trespassing, or suspicious activities
- Response actions taken
- Risk assessment
- Investigation findings
- Preventive measures

Format as a comprehensive security incident analysis.`,

            'annual-security': `Analyze this CSV data for an Annual Security Assessment. Provide:
- Overall security posture analysis
- Trend analysis from the data
- Threat landscape assessment
- Vulnerability identification
- Strategic recommendations
- Budget considerations

Format as an executive-level annual security review.`,

            'systems-audit': `Analyze this CSV data for a Security Systems Audit. Focus on:
- Equipment performance and status
- System failures or malfunctions
- Maintenance requirements
- Upgrade recommendations
- Compliance status

Format as a technical systems audit report.`,

            'discrepancy': `Analyze this CSV data for equipment discrepancies. Include:
- Specific equipment issues identified
- Impact on security operations
- Priority levels for repairs
- Root cause analysis
- Resolution timelines

Format as a discrepancy analysis report.`,

            'vehicle-inspection': `Analyze this CSV data for vehicle inspection findings. Cover:
- Vehicle condition assessments
- Safety concerns
- Maintenance requirements
- Operational readiness
- Fleet management recommendations

Format as a vehicle fleet analysis report.`
        };

        const analysisPrompt = prompts[reportType] || prompts['daily-log'];

        // Prepare the OpenAI API request
        const requestData = JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a professional security analyst creating detailed security reports. Always format your responses in the exact structure requested, using proper headers and professional language. Include specific data points from the CSV when available.`
                },
                {
                    role: "user",
                    content: `CLIENT: ${clientName}
DATE: ${reportDate}

${analysisPrompt}

CSV Data to analyze:
${csvData}

Please provide a detailed analysis formatted as a professional security report with clear sections and actionable insights.`
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        });

        // Make request to OpenAI API
        const response = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'api.openai.com',
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Length': Buffer.byteLength(requestData)
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, data }));
            });

            req.on('error', reject);
            req.write(requestData);
            req.end();
        });

        if (response.statusCode !== 200) {
            console.error('OpenAI API error:', response.data);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'AI analysis service error' })
            };
        }

        const openaiResponse = JSON.parse(response.data);
        const analysisContent = openaiResponse.choices[0].message.content;

        // Format the final report
        const formattedReport = `CLIENT: ${clientName}
DATE: ${reportDate}

═══════════════════════════════════════════════════
AI-GENERATED SECURITY ANALYSIS:
═══════════════════════════════════════════════════

${analysisContent}

═══════════════════════════════════════════════════
DATA SOURCE: CSV Analysis
GENERATED: ${new Date().toLocaleString()}
ANALYSIS ENGINE: VeriVault AI Intelligence
═══════════════════════════════════════════════════`;

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/plain'
            },
            body: formattedReport
        };

    } catch (error) {
        console.error('Error in CSV analysis function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error during CSV analysis',
                details: error.message 
            })
        };
    }
};
