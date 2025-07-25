import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10); // Railway uses PORT env var

// Middleware
app.use(helmet());

// Dynamic CORS configuration
const corsOrigins = [
  'http://localhost:3000', // Local development
  'http://localhost:3001', // Alternative local port
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

// Add any additional Netlify-style domains if CLIENT_URL is not set
if (!process.env.CLIENT_URL) {
  corsOrigins.push(
    'https://coruscating-starlight-ac42de.netlify.app', // Your specific Netlify deployment
    'https://*.netlify.app', // Allow any Netlify subdomain  
    'https://main--coruscating-starlight-ac42de.netlify.app' // Branch deployment URL
  );
}

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://coruscating-starlight-ac42de.netlify.app',
    'https://main--coruscating-starlight-ac42de.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
import authRoutes from './routes/auth';
import logsRoutes from './routes/logs';
import reportsRoutes from './routes/reports';
import dailyLogsRoutes from './routes/daily-logs';
import peopleRoutes from './routes/people';
import dailyEntriesRoutes from './routes/daily-entries';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/daily-logs', dailyLogsRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/daily-entries', dailyEntriesRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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