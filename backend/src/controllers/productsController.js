const { db } = require('../config/firebase');
const { TIER_LIMITS } = require('../services/subscriptionService');

const createProduct = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const productData = req.body;

        // 1. Fetch Vendor Data (check vendors collection first, then users)
        let vendorData = null;

        const vendorDoc = await db.collection('vendors').doc(vendorId).get();
        if (vendorDoc.exists) {
            vendorData = vendorDoc.data();
        }

        // Fallback to users collection
        if (!vendorData || !vendorData.subscriptionTier) {
            const userDoc = await db.collection('users').doc(vendorId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                vendorData = { ...vendorData, ...userData };
            }
        }

        if (!vendorData) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        // 2. Determine Tier and Limits
        const subscriptionTier = vendorData.subscriptionTier || 'Starter';
        const internalTierKey = Object.keys(TIER_LIMITS).find(key =>
            TIER_LIMITS[key].schemaTier === subscriptionTier && key.startsWith('vendor_')
        ) || 'vendor_bronze';

        const tierConfig = TIER_LIMITS[internalTierKey];
        const productLimit = tierConfig.products;
        const isApproved = vendorData.status === 'approved';

        // 3. Count Existing Products
        const productsSnapshot = await db.collection('insurance_products').where('vendorId', '==', vendorId).get();
        const currentCount = productsSnapshot.size;

        // Check if unlimited (Gold tier uses 9999 as unlimited)
        const isUnlimited = productLimit >= 9999;

        if (!isUnlimited && currentCount >= productLimit) {
            return res.status(403).json({
                error: 'Product limit reached',
                message: `Your ${subscriptionTier} plan allows ${productLimit} product${productLimit > 1 ? 's' : ''}. Upgrade to add more.`,
                limit: productLimit,
                current: currentCount,
                upgradeRequired: true,
                currentTier: subscriptionTier
            });
        }

        // 4. Create Product with status enforcement
        const initialStatus = isApproved ? (productData.status || 'Active') : 'Draft';

        const newProduct = {
            vendorId,
            ...productData,
            status: initialStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection('insurance_products').add(newProduct);

        res.status(201).json({
            id: docRef.id,
            ...newProduct,
            message: !isApproved && productData.status === 'Active'
                ? 'Product created as Draft. Account pending approval.'
                : 'Product created successfully'
        });
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

const updateProduct = async (req, res) => {
    try {
        const { vendorId, productId } = req.params;
        const updateData = req.body;

        // 1. Verify product exists and belongs to vendor
        const productRef = db.collection('insurance_products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productData = productDoc.data();
        if (productData.vendorId !== vendorId) {
            return res.status(403).json({ error: 'Unauthorized: Product does not belong to this vendor' });
        }

        // 2. Check vendor approval status if trying to activate
        if (updateData.status === 'Active' && productData.status !== 'Active') {
            // Fetch vendor status
            let vendorData = null;
            const vendorDoc = await db.collection('vendors').doc(vendorId).get();
            if (vendorDoc.exists) {
                vendorData = vendorDoc.data();
            }

            if (!vendorData || !vendorData.status) {
                const userDoc = await db.collection('users').doc(vendorId).get();
                if (userDoc.exists) {
                    vendorData = { ...vendorData, ...userDoc.data() };
                }
            }

            const isApproved = vendorData?.status === 'approved';
            if (!isApproved) {
                return res.status(403).json({
                    error: 'Cannot activate product',
                    message: 'Your vendor account must be approved before activating products.',
                    status: vendorData?.status || 'unknown'
                });
            }
        }

        // 3. Update product
        const updatedProduct = {
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await productRef.update(updatedProduct);

        res.json({
            id: productId,
            ...productData,
            ...updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

module.exports = { createProduct, getVendorProducts, updateProduct };
