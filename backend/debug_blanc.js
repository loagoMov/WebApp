const admin = require('firebase-admin');
const serviceAccount = require('./src/config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkBlanc() {
  console.log('Fetching all users to find "blanc"...');
  try {
    const snapshot = await db.collection('users').get();
    let found = false;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const stringData = JSON.stringify(data).toLowerCase();
      
      if (stringData.includes('blanc')) {
        console.log('\n--- FOUND MATCH ---');
        console.log('ID:', doc.id);
        console.log('Role:', data.role);
        console.log('Status:', data.status);
        console.log('Company Name:', data.companyName);
        console.log('Full Data:', JSON.stringify(data, null, 2));
        found = true;
      }
    });

    if (!found) {
      console.log('No user found with "blanc" in their data.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBlanc();
