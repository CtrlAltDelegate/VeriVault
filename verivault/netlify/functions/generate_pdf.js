const puppeteer = require('puppeteer');

exports.handler = async (event, context) => {
    // Set headers for CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse the request body
        const { content } = JSON.parse(event.body);

        if (!content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Content is required' })
            };
        }

        // Launch Puppeteer in headless mode
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Create HTML content for the PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    margin: 40px;
                    color: #333;
                }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>VeriVault Security Report</h1>
            </div>
            <div class="content">${content}</div>
        </body>
        </html>
        `;

        // Set the HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        });

        await browser.close();

        // Return the PDF as base64
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="verivault-report.pdf"'
            },
            body: pdfBuffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Error generating PDF:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to generate PDF',
                details: error.message 
            })
        };
    }
};
