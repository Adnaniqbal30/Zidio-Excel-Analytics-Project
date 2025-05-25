const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ExcelData = require('../models/excelData');
const Admin = require('../models/admin');
const AuditLog = require('../models/auditLog');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const auditLogger = require('../middleware/auditLogger');

// Get all users (admin only)
router.get('/users', auth, adminAuth(['view_users']), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user details
router.get('/users/:id', auth, adminAuth(['view_users']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user status
router.patch(
  '/users/:id/status',
  auth,
  adminAuth(['manage_users']),
  auditLogger('user_status_update', 'user'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  }
);

// Get all uploaded files
router.get('/files', auth, adminAuth(['view_data']), async (req, res) => {
  try {
    const files = await ExcelData.find()
      .populate('userId', 'name email')
      .sort({ uploadDate: -1 });
    
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
});

// Get file details
router.get('/files/:id', auth, adminAuth(['view_data']), async (req, res) => {
  try {
    const file = await ExcelData.findById(req.params.id)
      .populate('userId', 'name email');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file', error: error.message });
  }
});

// Delete file
router.delete(
  '/files/:id',
  auth,
  adminAuth(['manage_data']),
  auditLogger('file_delete', 'file'),
  async (req, res) => {
    try {
      const file = await ExcelData.findByIdAndDelete(req.params.id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
  }
);

// Get audit logs
router.get('/audit-logs', auth, adminAuth(['view_audit_logs']), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetType, startDate, endDate } = req.query;
    
    const query = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('adminId', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

// Get platform statistics
router.get('/stats', auth, adminAuth(['view_analytics']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await ExcelData.countDocuments();
    const totalStorage = await ExcelData.aggregate([
      {
        $project: {
          dataSize: { $size: '$data' }
        }
      },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$dataSize' }
        }
      }
    ]);

    const recentUploads = await ExcelData.find()
      .sort({ uploadDate: -1 })
      .limit(5)
      .populate('userId', 'name email');

    const userActivity = await ExcelData.aggregate([
      {
        $group: {
          _id: '$userId',
          uploadCount: { $sum: 1 },
          lastUpload: { $max: '$uploadDate' }
        }
      },
      {
        $sort: { uploadCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      totalUsers,
      totalFiles,
      totalStorage: totalStorage[0]?.totalSize || 0,
      recentUploads,
      userActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router; 