const { ManagementClient } = require('auth0');
const dotenv = require('dotenv');

dotenv.config();

let managementClient;

try {
    if (process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET) {
        managementClient = new ManagementClient({
            domain: process.env.AUTH0_DOMAIN,
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
        });
        console.log('Auth0 Management Client initialized');
    } else {
        console.warn('Auth0 Management Client NOT initialized: Missing credentials in .env');
    }
} catch (error) {
    console.error('Error initializing Auth0 Management Client:', error);
}

module.exports = managementClient;
