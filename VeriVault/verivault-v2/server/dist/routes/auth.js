"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// In-memory user storage with PIN codes (replace with database)
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'password', // In production, this should be hashed
        role: 'administrator',
        pin: '1234', // 4-digit PIN
        pinHash: crypto_1.default.createHash('sha256').update('1234').digest('hex') // Hashed PIN
    }
];
// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            token: 'demo-jwt-token' // TODO: Generate real JWT
        });
    }
    else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});
// PIN verification endpoint
router.post('/verify-pin', (req, res) => {
    const { userId, pin } = req.body;
    if (!userId || !pin) {
        return res.status(400).json({
            success: false,
            message: 'User ID and PIN are required'
        });
    }
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    // Verify PIN
    if (user.pin === pin) {
        // Generate verification hash for watermarking
        const verificationHash = crypto_1.default.createHash('sha256')
            .update(`${user.id}-${pin}-${Date.now()}`)
            .digest('hex')
            .substring(0, 16);
        res.json({
            success: true,
            message: 'PIN verified successfully',
            verificationData: {
                userHash: user.pinHash.substring(0, 8),
                timestamp: new Date().toISOString(),
                verificationHash: verificationHash
            }
        });
    }
    else {
        res.status(401).json({
            success: false,
            message: 'Invalid PIN'
        });
    }
});
// Update PIN endpoint
router.post('/update-pin', (req, res) => {
    const { userId, oldPin, newPin } = req.body;
    if (!userId || !oldPin || !newPin) {
        return res.status(400).json({
            success: false,
            message: 'User ID, old PIN, and new PIN are required'
        });
    }
    if (!/^\d{4}$/.test(newPin)) {
        return res.status(400).json({
            success: false,
            message: 'PIN must be exactly 4 digits'
        });
    }
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    if (user.pin !== oldPin) {
        return res.status(401).json({
            success: false,
            message: 'Current PIN is incorrect'
        });
    }
    // Update PIN
    user.pin = newPin;
    user.pinHash = crypto_1.default.createHash('sha256').update(newPin).digest('hex');
    res.json({
        success: true,
        message: 'PIN updated successfully'
    });
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
exports.default = router;
//# sourceMappingURL=auth.js.map