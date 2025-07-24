"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '8080', 10); // Railway uses PORT env var
// Middleware
app.use((0, helmet_1.default)());
// Dynamic CORS configuration
const corsOrigins = [
    'http://localhost:3000', // Local development
    'http://localhost:3001', // Alternative local port
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];
// Add any additional Netlify-style domains if CLIENT_URL is not set
if (!process.env.CLIENT_URL) {
    corsOrigins.push('https://*.netlify.app', // Allow any Netlify subdomain
    'https://coruscating-starlight-ac42de.netlify.app' // Fallback for existing deployment
    );
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Check if origin matches any allowed origins
        const isAllowed = corsOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                // Handle wildcard domains like *.netlify.app
                const pattern = allowedOrigin.replace(/\*/g, '.*');
                return new RegExp(pattern).test(origin);
            }
            return allowedOrigin === origin;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'VeriVault Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
    });
});
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const logs_1 = __importDefault(require("./routes/logs"));
const reports_1 = __importDefault(require("./routes/reports"));
const daily_logs_1 = __importDefault(require("./routes/daily-logs"));
const people_1 = __importDefault(require("./routes/people"));
const daily_entries_1 = __importDefault(require("./routes/daily-entries"));
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/logs', logs_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/daily-logs', daily_logs_1.default);
app.use('/api/people', people_1.default);
app.use('/api/daily-entries', daily_entries_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VeriVault Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for origins:`, corsOrigins);
    console.log(`🔒 Security: Helmet enabled`);
    console.log(`📋 Multi-LLM Review: Planned for future implementation`);
    console.log(`💡 Health check available at: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=server.js.map