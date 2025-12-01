// middleware/authMiddleware.js

// Checks if the user is logged in
export const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }
    next();
};

// Checks if the user has one or more allowed roles
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
        }
        const userRole = req.session.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

// Optional: Middleware to attach user info to res.locals for templating
export const attachUser = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
};
