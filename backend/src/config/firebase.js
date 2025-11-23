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
    try {
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'coverbots-b9f79.firebasestorage.app'
        });
        console.log('Firebase Admin initialized with service account');
    } catch (error) {
        console.warn('Service account key not found or invalid. Falling back to default credentials.');
        admin.initializeApp({
            storageBucket: 'coverbots-b9f79.firebasestorage.app'
        });
    }
}

const db = admin.firestore();

module.exports = { admin, db };
