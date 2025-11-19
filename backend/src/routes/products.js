const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to parent params
const { createProduct, getVendorProducts } = require('../controllers/productsController');

router.post('/', createProduct);
router.get('/', getVendorProducts);

module.exports = router;
