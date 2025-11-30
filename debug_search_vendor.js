const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugVendor() {
  console.log('Searching for vendor "blanc"...');
  try {
    // Try to find by companyName (case-insensitive simulation if possible, but Firestore is exact)
    // We'll fetch all and filter to see what "blanc" looks like
    const snapshot = await db.collection('vendors').get();
    let found = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (JSON.stringify(data).toLowerCase().includes('blanc')) {
        console.log('Found potential match:', doc.id, data);
        found = true;
      }
    });
    
    if (!found) {
      console.log('No vendor found containing "blanc" in any field.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debugVendor();
