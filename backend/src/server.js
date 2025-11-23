const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const checkJwt = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// Protected Routes
app.use('/api/vendors', checkJwt, require('./routes/vendors'));
app.use('/api/vendors/:vendorId/products', checkJwt, require('./routes/products'));
app.use('/api/leads', checkJwt, require('./routes/leads')); // For creating leads (user)
app.use('/api/vendors/:vendorId/leads', checkJwt, require('./routes/leads')); // For viewing leads (vendor)
app.use('/api/vendors/:vendorId/bids', checkJwt, require('./routes/bids'));
app.use('/api/quotes', checkJwt, require('./routes/quotes'));
app.use('/api/users', checkJwt, require('./routes/users'));

// AI Service Proxy
const axios = require('axios');
app.post('/api/recommend', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8000/recommend', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('AI Service Error:', error.message);
        res.status(500).json({ error: 'Failed to get recommendations' });
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
