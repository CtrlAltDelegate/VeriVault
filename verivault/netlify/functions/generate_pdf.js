exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { content } = JSON.parse(event.body);
        
        if (!content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Content is required' })
            };
        }

        // Create HTML content for download
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VeriVault Security Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 40px;
            color: #333;
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db; 
            padding-bottom: 10px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .content { 
            white-space: pre-wrap; 
        }
        @media print {
            body { margin: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>VeriVault Security Report</h1>
    </div>
    <div class="content">${content}</div>
    <script>
        // Auto-open print dialog
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
        `;

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/html',
                'Content-Disposition': 'attachment; filename="verivault-report.html"'
            },
            body: htmlContent
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to generate report',
                details: error.message 
            })
        };
    }
};
