// Checks if the user is logged in
export const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }
    next();
};

// Checks if the user has a specific role
export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized: Please log in' });
        }
        if (req.session.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
