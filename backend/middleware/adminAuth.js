const Admin = require('../models/Admin');

const adminAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Find admin record
      const admin = await Admin.findOne({ userId: req.user.id });
      if (!admin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          admin.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      // Add admin info to request
      req.admin = admin;
      next();
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ message: 'Error checking admin authorization' });
    }
  };
};

module.exports = adminAuth; 