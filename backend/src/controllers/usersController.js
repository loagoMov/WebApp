const { db, admin } = require('../config/firebase');

const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, phone, location, role, companyName, taxId } = req.body;
        const file = req.file;

        let photoURL = null;

        // 1. Upload Photo to Firebase Storage (if file exists)
        if (file) {
            const bucket = admin.storage().bucket();
            const filename = `profile_photos/${userId}_${Date.now()}`;
            const fileUpload = bucket.file(filename);

            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype
                }
            });

            // Make the file public or generate a signed URL
            // For simplicity, we'll generate a signed URL valid for a long time (e.g., 100 years)
            // Ideally, you'd make the bucket public or use a proxy for images
            const [url] = await fileUpload.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });
            photoURL = url;
        }

        // 2. Update Firestore
        const userRef = db.collection('users').doc(userId);
        const updateData = {
            fullName,
            phone,
            location,
            updatedAt: new Date().toISOString()
        };

        if (companyName) updateData.companyName = companyName;
        if (taxId) updateData.taxId = taxId;

        if (role !== undefined) {
            updateData.role = role;
            if (role === 'vendor') {
                updateData.status = 'pending';
            }
        }

        if (photoURL) {
            updateData.photoURL = photoURL;
        }

        await userRef.set(updateData, { merge: true });
        console.log(`Successfully wrote profile data for user ${userId} to Firestore`);

        res.json({ message: 'Profile updated successfully', photoURL });
    } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Error stack:', error.stack);
        if (error.code) console.error('Error code:', error.code);
        if (error.details) console.error('Error details:', error.details);
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const doc = await db.collection('users').doc(userId).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(doc.data());
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

const deleteUser = async (req, res) => {
    const { deleteUserFiles, deleteVendorFiles } = require('../services/storageService');

    try {
        const { userId } = req.params;
        console.log(`Starting deletion process for user ${userId}`);

        // 1. Get user data to determine role and cleanup needs
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            console.log(`User ${userId} not found in Firestore, proceeding with Auth deletion only`);
        } else {
            const userData = userDoc.data();
            const isVendor = userData.role === 'vendor';

            // 2. If vendor, delete all vendor-related data
            if (isVendor) {
                console.log(`User ${userId} is a vendor, performing vendor cleanup...`);

                // Delete products
                const productsSnapshot = await db.collection('insurance_products')
                    .where('vendorId', '==', userId)
                    .get();

                const productDeletePromises = [];
                productsSnapshot.forEach(doc => {
                    productDeletePromises.push(doc.ref.delete());
                });
                await Promise.all(productDeletePromises);
                console.log(`Deleted ${productsSnapshot.size} products for vendor ${userId}`);

                // Delete bids
                const bidsSnapshot = await db.collection('bids')
                    .where('vendorId', '==', userId)
                    .get();

                const bidDeletePromises = [];
                bidsSnapshot.forEach(doc => {
                    bidDeletePromises.push(doc.ref.delete());
                });
                await Promise.all(bidDeletePromises);
                console.log(`Deleted ${bidsSnapshot.size} bids for vendor ${userId}`);

                // Delete leads where vendor is the recipient
                const leadsSnapshot = await db.collection('leads')
                    .where('vendorId', '==', userId)
                    .get();

                const leadDeletePromises = [];
                leadsSnapshot.forEach(doc => {
                    leadDeletePromises.push(doc.ref.delete());
                });
                await Promise.all(leadDeletePromises);
                console.log(`Deleted ${leadsSnapshot.size} leads for vendor ${userId}`);

                // Delete vendor files from storage (policy documents, etc.)
                try {
                    await deleteVendorFiles(userId);
                } catch (storageError) {
                    console.error('Error deleting vendor files:', storageError);
                    // Continue with deletion even if storage cleanup fails
                }
            }

            // 3. Delete user-related data (for all users)

            // Delete quotes
            const quotesSnapshot = await db.collection('quotes')
                .where('userId', '==', userId)
                .get();

            const quoteDeletePromises = [];
            quotesSnapshot.forEach(doc => {
                quoteDeletePromises.push(doc.ref.delete());
            });
            await Promise.all(quoteDeletePromises);
            console.log(`Deleted ${quotesSnapshot.size} quotes for user ${userId}`);

            // Delete leads created by this user
            const userLeadsSnapshot = await db.collection('leads')
                .where('userId', '==', userId)
                .get();

            const userLeadDeletePromises = [];
            userLeadsSnapshot.forEach(doc => {
                userLeadDeletePromises.push(doc.ref.delete());
            });
            await Promise.all(userLeadDeletePromises);
            console.log(`Deleted ${userLeadsSnapshot.size} user leads for ${userId}`);

            // Delete payments/subscriptions
            const paymentsSnapshot = await db.collection('payments')
                .where('userId', '==', userId)
                .get();

            const paymentDeletePromises = [];
            paymentsSnapshot.forEach(doc => {
                paymentDeletePromises.push(doc.ref.delete());
            });
            await Promise.all(paymentDeletePromises);
            console.log(`Deleted ${paymentsSnapshot.size} payment records for user ${userId}`);

            // 4. Delete user files from storage (profile photos, etc.)
            try {
                await deleteUserFiles(userId);
            } catch (storageError) {
                console.error('Error deleting user files:', storageError);
                // Continue with deletion even if storage cleanup fails
            }
        }

        // 5. Delete user document from Firestore
        await db.collection('users').doc(userId).delete();
        console.log(`Deleted user document for ${userId}`);

        // 6. Delete from Firebase Auth
        try {
            await admin.auth().deleteUser(userId);
            console.log(`User ${userId} deleted from Firebase Auth`);
        } catch (authError) {
            console.error('Error deleting user from Firebase Auth:', authError);
            // If user not found in Auth, it might have been already deleted or never existed there
            if (authError.code !== 'auth/user-not-found') {
                throw authError;
            }
        }

        console.log(`Successfully deleted all data for user ${userId}`);
        res.json({
            message: 'User account and all associated data deleted successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user account', details: error.message });
    }
};

const getPendingVendors = async (req, res) => {
    try {
        const vendorsRef = db.collection('users');
        const snapshot = await vendorsRef.where('role', '==', 'vendor').where('status', '==', 'pending').get();

        const pendingVendors = [];
        snapshot.forEach(doc => {
            pendingVendors.push({ id: doc.id, ...doc.data() });
        });

        res.json(pendingVendors);
    } catch (error) {
        console.error('Error fetching pending vendors:', error);
        res.status(500).json({ error: 'Failed to fetch pending vendors' });
    }
};

const updateVendorStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await db.collection('users').doc(userId).update({ status });

        res.json({ message: `Vendor status updated to ${status}` });
    } catch (error) {
        console.error('Error updating vendor status:', error);
        res.status(500).json({ error: 'Failed to update vendor status' });
    }
};

module.exports = { updateProfile, getProfile, deleteUser, getPendingVendors, updateVendorStatus };

