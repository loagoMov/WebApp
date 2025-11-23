const { db, admin } = require('../config/firebase');
const managementClient = require('../config/auth0');

const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, phone, location, role } = req.body;
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

        if (role !== undefined) {
            updateData.role = role;
        }

        if (photoURL) {
            updateData.photoURL = photoURL;
        }

        await userRef.set(updateData, { merge: true });

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
    try {
        const { userId } = req.params;

        // 1. Delete from Firestore
        await db.collection('users').doc(userId).delete();

        // 2. Delete from Auth0 (if configured)
        if (managementClient) {
            try {
                await managementClient.users.delete({ id: userId });
                console.log(`User ${userId} deleted from Auth0`);
            } catch (auth0Error) {
                console.error('Error deleting user from Auth0:', auth0Error);
                // We don't fail the request if Auth0 deletion fails, but we log it.
            }
        } else {
            console.warn('Skipping Auth0 deletion: Management Client not initialized');
        }

        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user account' });
    }
};

module.exports = { updateProfile, getProfile, deleteUser };

