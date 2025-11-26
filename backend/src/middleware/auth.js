const admin = require('firebase-admin');

// Authorization middleware using Firebase Admin SDK
const checkJwt = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Normalize the user object to match previous Auth0 structure where possible, 
        // or adapt controllers to use this new structure.
        // Firebase 'sub' is the 'uid'.
        req.auth = {
            payload: {
                sub: decodedToken.uid,
                email: decodedToken.email,
                ...decodedToken
            }
        };
        // Also set req.user for convenience if used elsewhere
        req.user = decodedToken;

        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = checkJwt;
