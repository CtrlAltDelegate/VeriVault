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
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/logs', logs_1.default);
app.use('/api/reports', reports_1.default);
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
    console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`🔒 Security: Helmet enabled`);
    console.log(`📋 Multi-LLM Review: Planned for future implementation`);
});
//# sourceMappingURL=server.js.map