const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const checkJwt = require('./middleware/auth');
const authorize = require('./middleware/authorize');
const { apiLimiter } = require('./middleware/rateLimit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

app.use((req, res, next) => {
    if (req.originalUrl === '/api/subscriptions/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Webhook route must be defined BEFORE express.json() to access raw body
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use((req, res, next) => {
    if (req.originalUrl === '/api/subscriptions/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Public Routes
app.get('/', (req, res) => {
    res.send('CoverBots API is running');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Protected Routes with Authorization
// app.use('/api/auth', checkJwt, require('./routes/auth')); // Removed during Firebase migration
app.use('/api/vendors', checkJwt, require('./routes/vendors'));
app.use('/api/vendors/:vendorId/products', checkJwt, authorize({ roles: ['vendor', 'admin'] }), require('./routes/products'));
app.use('/api/leads', checkJwt, require('./routes/leads'));
app.use('/api/vendors/:vendorId/leads', checkJwt, authorize({ roles: ['vendor', 'admin'] }), require('./routes/leads'));
app.use('/api/vendors/:vendorId/bids', checkJwt, authorize({ roles: ['vendor', 'admin'] }), require('./routes/bids'));
app.use('/api/quotes', checkJwt, require('./routes/quotes'));
app.use('/api/users', checkJwt, require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/search', require('./routes/search'));

// AI Service Proxy
// AI Service Proxy
const axios = require('axios');
const { db } = require('./config/firebase');

app.post('/api/recommend', async (req, res) => {
    try {
        // 1. Fetch active vendors from Firestore
        const vendorsRef = db.collection('users');
        const snapshot = await vendorsRef.where('role', '==', 'vendor').where('status', '==', 'approved').get();

        const activeVendorIds = [];
        snapshot.forEach(doc => {
            activeVendorIds.push(doc.id);
        });

        // 2. Fetch active products from these vendors
        let products = [];
        if (activeVendorIds.length > 0) {
            // Firestore 'in' query supports up to 10 items. For more, we'd need to batch or fetch all and filter.
            // For MVP, we'll fetch all products and filter in memory if list is large, or use multiple queries.
            // Here we'll fetch all products and filter by vendorId and status='Active'
            const productsRef = db.collection('insurance_products');
            const productsSnapshot = await productsRef.where('status', '==', 'Active').get();

            // Fetch vendor details for contact info
            const vendorDetailsMap = {};
            for (const vendorId of activeVendorIds) {
                const vendorDoc = await db.collection('users').doc(vendorId).get();
                if (vendorDoc.exists) {
                    const vendorData = vendorDoc.data();
                    vendorDetailsMap[vendorId] = {
                        email: vendorData.email || '',
                        phone: vendorData.phone || '',
                        companyName: vendorData.companyName || vendorData.fullName || 'Unknown Vendor'
                    };
                }
            }

            productsSnapshot.forEach(doc => {
                const data = doc.data();
                if (activeVendorIds.includes(data.vendorId)) {
                    const vendorInfo = vendorDetailsMap[data.vendorId] || {};
                    products.push({
                        id: doc.id,
                        ...data,
                        vendorEmail: vendorInfo.email,
                        vendorPhone: vendorInfo.phone,
                        vendorCompanyName: vendorInfo.companyName
                    });
                }
            });
        }

        // 3. Pass active_vendor_ids and products to AI Service
        const payload = {
            ...req.body,
            active_vendor_ids: activeVendorIds,
            products: products
        };

        const response = await axios.post('http://localhost:8000/recommend', payload);
        res.json(response.data);
    } catch (error) {
        console.error('AI Service Error:', error.message);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

// Policy Upload Proxy
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-policy', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const vendorId = req.body.vendorId;
        const filePath = req.file.path;

        // Prepare form data for AI Service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), req.file.originalname);

        // Forward to AI Service
        const aiResponse = await axios.post(`http://localhost:8000/ingest?vendor_id=${vendorId}`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Cleanup temp file
        fs.unlinkSync(filePath);

        res.json(aiResponse.data);
    } catch (error) {
        console.error('Policy Upload Error:', error.message);
        // Cleanup temp file if exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload policy to AI service' });
    }
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'UnauthorizedError') {
        return res.status(401).send('Invalid token');
    }
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
