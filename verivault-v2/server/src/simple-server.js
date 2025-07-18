const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let logs = [];
let logIdCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VeriVault Server is running' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: 1, username: 'admin', role: 'administrator' },
      token: 'demo-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Log routes
app.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  });
});

app.post('/api/logs', (req, res) => {
  const { category, timestamp, location, subject, action, priority, notes } = req.body;
  
  const newLog = {
    id: logIdCounter++,
    category,
    timestamp: timestamp || new Date().toISOString(),
    location,
    subject,
    action,
    priority: priority || 'low',
    notes,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  };
  
  logs.push(newLog);
  
  res.status(201).json({
    success: true,
    message: 'Log entry created successfully',
    log: newLog
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VeriVault Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/api/health`);
}); 