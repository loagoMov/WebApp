const admin = require('firebase-admin');
const { db } = require('../config/firebase');

/**
 * Delete all files in a user's storage directory
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Number of files deleted
 */
const deleteUserFiles = async (userId) => {
    try {
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({
            prefix: `users/${userId}/`
        });

        if (files.length === 0) {
            console.log(`No files found for user ${userId}`);
            return 0;
        }

        // Delete all files
        await Promise.all(files.map(file => file.delete()));
        console.log(`Deleted ${files.length} files for user ${userId}`);
        return files.length;
    } catch (error) {
        console.error(`Error deleting user files for ${userId}:`, error);
        throw error;
    }
};

/**
 * Delete all files in a vendor's storage directory
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<number>} Number of files deleted
 */
const deleteVendorFiles = async (vendorId) => {
    try {
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({
            prefix: `vendors/${vendorId}/`
        });

        if (files.length === 0) {
            console.log(`No files found for vendor ${vendorId}`);
            return 0;
        }

        // Delete all files (policy documents, etc.)
        await Promise.all(files.map(file => file.delete()));
        console.log(`Deleted ${files.length} files for vendor ${vendorId}`);
        return files.length;
    } catch (error) {
        console.error(`Error deleting vendor files for ${vendorId}:`, error);
        throw error;
    }
};

/**
 * Delete a specific file from storage
 * @param {string} filePath - The file path in storage
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteFile = async (filePath) => {
    try {
        const bucket = admin.storage().bucket();
        await bucket.file(filePath).delete();
        console.log(`Deleted file: ${filePath}`);
        return true;
    } catch (error) {
        if (error.code === 404) {
            console.log(`File not found: ${filePath}`);
            return false;
        }
        console.error(`Error deleting file ${filePath}:`, error);
        throw error;
    }
};

module.exports = {
    deleteUserFiles,
    deleteVendorFiles,
    deleteFile
};
