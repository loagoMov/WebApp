const { db } = require('../config/firebase');

const createVendor = async (req, res) => {
    try {
        const { companyName, contactPerson, email, phone, address } = req.body;
        const userId = req.auth.payload.sub; // From Auth0 token

        const vendorData = {
            companyName,
            contactPerson,
            email,
            phone,
            address,
            ownerId: userId,
            verificationStatus: 'pending',
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('vendors').add(vendorData);
        res.status(201).json({ id: docRef.id, ...vendorData });
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ error: 'Failed to create vendor' });
    }
};

const getVendorProfile = async (req, res) => {
    try {
        const userId = req.auth.payload.sub;
        const snapshot = await db.collection('vendors').where('ownerId', '==', userId).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Vendor profile not found' });
        }

        const doc = snapshot.docs[0];
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching vendor profile:', error);
        res.status(500).json({ error: 'Failed to fetch vendor profile' });
    }
};

module.exports = { createVendor, getVendorProfile };
