const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { updateProfile, getProfile, deleteUser, getPendingVendors, updateVendorStatus } = require('../controllers/usersController');
const { sendVendorApplicationEmail } = require('../services/emailService');

router.get('/pending-vendors', getPendingVendors);
router.put('/:userId/status', updateVendorStatus);
router.put('/:userId', upload.single('photo'), updateProfile);
router.get('/:userId', getProfile);
router.delete('/:userId', deleteUser);

// Send vendor application notification email
router.post('/notify-vendor-application', async (req, res) => {
    try {
        const { vendorData } = req.body;

        if (!vendorData || !vendorData.email) {
            return res.status(400).json({ error: 'Vendor data with email is required' });
        }

        const result = await sendVendorApplicationEmail(vendorData);

        if (result.success) {
            res.json({ message: 'Email notification sent successfully', messageId: result.messageId });
        } else {
            res.status(500).json({ error: 'Failed to send email notification', details: result.error });
        }
    } catch (error) {
        console.error('Error in notify-vendor-application endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
