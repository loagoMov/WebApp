const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { updateProfile, getProfile, deleteUser, getPendingVendors, updateVendorStatus } = require('../controllers/usersController');

router.get('/pending-vendors', getPendingVendors);
router.put('/:userId/status', updateVendorStatus);
router.put('/:userId', upload.single('photo'), updateProfile);
router.get('/:userId', getProfile);
router.delete('/:userId', deleteUser);

module.exports = router;
