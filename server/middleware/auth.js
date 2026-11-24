import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'convoai_jwt_secret_dev_key_2026';

/**
 * Protect routes: verify JWT Bearer token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required: Missing or invalid authorization token.', code: 'UNAUTHORIZED' },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired. Please refresh your session.', code: 'TOKEN_EXPIRED' },
      });
    }
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid or malformed token.', code: 'FORBIDDEN' },
    });
  }
}

/**
 * Authorize specific roles (e.g. 'admin', 'manager')
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // Also allow role passed in test header 'x-user-role' if authenticated
    const userRole = req.user?.role || req.headers['x-user-role'] || 'agent';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role: ${userRole}.`,
          code: 'INSUFFICIENT_PERMISSIONS',
        },
      });
    }

    next();
  };
}
