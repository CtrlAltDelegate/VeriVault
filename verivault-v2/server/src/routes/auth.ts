import { Router } from 'express';

const router = Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // TODO: Implement proper authentication
  // For now, simple demo authentication
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        username: 'admin',
        role: 'administrator'
      },
      token: 'demo-jwt-token' // TODO: Generate real JWT
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user
router.get('/me', (req, res) => {
  // TODO: Implement JWT verification middleware
  res.json({
    user: {
      id: 1,
      username: 'admin',
      role: 'administrator'
    }
  });
});

export default router; 