exports.handler = async (event, context) => {
    // Set headers for CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { clientName, reportDate, reportContent, reportType } = JSON.parse(event.body);

        // For now, let's test if the function is working at all
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: false,
                error: 'PDF generation not yet implemented - function is working but PDF library needs setup',
                receivedData: {
                    clientName,
                    reportDate,
                    hasContent: !!reportContent
                }
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Function error: ' + error.message 
            })
        };
    }
};
