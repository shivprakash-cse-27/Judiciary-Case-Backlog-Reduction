const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      // Try Authorization header as fallback
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (err) {
      // Token expired - try refresh
      if (err.name === 'TokenExpiredError') {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Token expired, please login again'
          });
        }

        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const user = await User.findById(decoded.id).select('+refreshToken');

          if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
              success: false,
              message: 'Invalid refresh token'
            });
          }

          // Generate new access token
          const newAccessToken = user.generateAccessToken();

          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
          });

          req.user = user;
          next();
        } catch (refreshErr) {
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token invalid'
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Authorize by role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
