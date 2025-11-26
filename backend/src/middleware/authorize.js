const { db } = require('../config/firebase');

/**
 * Authorization middleware for role-based and resource-based access control
 * @param {Object} options - Authorization options
 * @param {Array<string>} options.roles - Required roles (e.g., ['admin', 'vendor'])
 * @param {boolean} options.checkOwnership - Whether to check if user owns the resource
 * @param {string} options.resourceParam - Name of the param containing the resource userId (default: 'userId')
 */
const authorize = (options = {}) => {
    return async (req, res, next) => {
        try {
            const userId = req.auth.payload.sub;

            // Fetch user from database to get role
            const userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userData = userDoc.data();
            const userRole = userData.role || 'user';

            // Check role-based authorization
            if (options.roles && options.roles.length > 0) {
                if (!options.roles.includes(userRole)) {
                    return res.status(403).json({
                        error: 'Insufficient permissions',
                        required: options.roles,
                        current: userRole
                    });
                }
            }

            // Check resource ownership
            if (options.checkOwnership) {
                const resourceParam = options.resourceParam || 'userId';
                const resourceUserId = req.params[resourceParam];

                // Allow admin to access any resource
                if (userRole !== 'admin' && resourceUserId && resourceUserId !== userId) {
                    return res.status(403).json({
                        error: 'Access denied. You can only access your own resources.'
                    });
                }
            }

            // Attach user data to request for use in controllers
            req.user = { id: userId, role: userRole, ...userData };

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ error: 'Authorization failed' });
        }
    };
};

module.exports = authorize;
