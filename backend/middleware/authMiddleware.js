const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication is required",
        });
    }

    const authToken = authorization.slice("Bearer ".length).trim();

    if (!authToken) {
        return res.status(401).json({
            success: false,
            message: "Authentication is required",
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Authentication service is unavailable",
        });
    }

    try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!decodedToken.userId || !decodedToken.role) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        req.user = {
            userId: decodedToken.userId,
            role: decodedToken.role,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token",
        });
    }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource",
        });
    }

    return next();
};

module.exports = {
    authenticate,
    requireRole,
};
