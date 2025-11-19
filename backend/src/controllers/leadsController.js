const { db } = require('../config/firebase');

const createLead = async (req, res) => {
    try {
        const { vendorId, productId, category, questionnaireAnswers } = req.body;
        const userId = req.auth.payload.sub;

        const leadData = {
            userId,
            vendorId,
            productId,
            category,
            questionnaireAnswers,
            status: 'new',
            routedVia: 'email', // Default for MVP
            consentGiven: true,
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('leads').add(leadData);

        // TODO: Trigger notification (Email/WhatsApp) to vendor

        res.status(201).json({ id: docRef.id, ...leadData });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
};

const getVendorLeads = async (req, res) => {
    try {
        const { vendorId } = req.params;
        // TODO: Verify ownership

        const snapshot = await db.collection('leads').where('vendorId', '==', vendorId).get();

        const leads = [];
        snapshot.forEach(doc => {
            leads.push({ id: doc.id, ...doc.data() });
        });

        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

module.exports = { createLead, getVendorLeads };
