const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Check if running in emulator or production
if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Using Firestore Emulator');
    admin.initializeApp({
        projectId: 'coverbots-mvp',
    });
} else {
    // In production, use service account or default credentials
    // For now, we'll use application default credentials
    admin.initializeApp();
}

const db = admin.firestore();

module.exports = { admin, db };
