const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { updateProfile, getProfile, deleteUser } = require('../controllers/usersController');

router.put('/:userId', upload.single('photo'), updateProfile);
router.get('/:userId', getProfile);
router.delete('/:userId', deleteUser);

module.exports = router;
