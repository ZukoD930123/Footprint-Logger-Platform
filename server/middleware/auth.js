const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, 'secretKey');
        
        // 3. ATTACH USER ID TO REQUEST (Critical step!)
        req.user = decoded.userId; 
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
