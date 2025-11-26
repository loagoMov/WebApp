const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to parent params
const { createProduct, getVendorProducts, updateProduct } = require('../controllers/productsController');

router.post('/', createProduct);
router.get('/', getVendorProducts);
router.put('/:productId', updateProduct);

module.exports = router;
