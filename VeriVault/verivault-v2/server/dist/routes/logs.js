"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// In-memory storage for demo (replace with database)
let logs = [];
let logIdCounter = 1;
// Get all logs
router.get('/', (req, res) => {
    res.json({
        success: true,
        logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    });
});
// Create new log entry
router.post('/', (req, res) => {
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
        createdBy: 'admin' // TODO: Get from JWT token
    };
    logs.push(newLog);
    res.status(201).json({
        success: true,
        message: 'Log entry created successfully',
        log: newLog
    });
});
// Get log by ID
router.get('/:id', (req, res) => {
    const log = logs.find(l => l.id === parseInt(req.params.id));
    if (!log) {
        return res.status(404).json({
            success: false,
            message: 'Log entry not found'
        });
    }
    res.json({
        success: true,
        log
    });
});
// Update log entry
router.put('/:id', (req, res) => {
    const logIndex = logs.findIndex(l => l.id === parseInt(req.params.id));
    if (logIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Log entry not found'
        });
    }
    logs[logIndex] = {
        ...logs[logIndex],
        ...req.body,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // TODO: Get from JWT token
    };
    res.json({
        success: true,
        message: 'Log entry updated successfully',
        log: logs[logIndex]
    });
});
// Delete log entry
router.delete('/:id', (req, res) => {
    const logIndex = logs.findIndex(l => l.id === parseInt(req.params.id));
    if (logIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Log entry not found'
        });
    }
    logs.splice(logIndex, 1);
    res.json({
        success: true,
        message: 'Log entry deleted successfully'
    });
});
exports.default = router;
//# sourceMappingURL=logs.js.map