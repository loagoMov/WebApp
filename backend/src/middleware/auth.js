const { auth } = require('express-oauth2-jwt-bearer');
const dotenv = require('dotenv');

dotenv.config();

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE || 'https://coverbots.api',
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-placeholder.auth0.com/',
});

module.exports = checkJwt;
