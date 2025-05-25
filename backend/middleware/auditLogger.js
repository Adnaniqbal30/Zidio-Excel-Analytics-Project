const AuditLog = require('../models/auditLog');

const auditLogger = (action, targetType) => async (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    const result = res.send.call(this, data);

    // Only log successful operations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const logData = {
        adminId: req.user._id,
        action,
        targetType,
        targetId: req.params.id,
        details: {
          ...req.body,
          statusCode: res.statusCode
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      };

      AuditLog.create(logData).catch(err => {
        console.error('Error creating audit log:', err);
      });
    }

    return result;
  };

  next();
};

module.exports = auditLogger; 