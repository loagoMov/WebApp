const { db } = require('../config/firebase');

const createProduct = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const productData = req.body;

        // TODO: Verify that the requesting user owns the vendorId

        const newProduct = {
            vendorId,
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection('insurance_products').add(newProduct);
        res.status(201).json({ id: docRef.id, ...newProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

const getVendorProducts = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const snapshot = await db.collection('insurance_products').where('vendorId', '==', vendorId).get();

        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

module.exports = { createProduct, getVendorProducts };
