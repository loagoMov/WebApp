const { db } = require('../config/firebase');

// Log an analytics event
exports.logEvent = async (req, res) => {
    try {
        const { eventType, metadata } = req.body;
        const userId = req.user ? req.user.uid : (req.body.userId || 'anonymous');

        // Basic validation
        if (!eventType) {
            return res.status(400).json({ error: 'Event type is required' });
        }

        const eventData = {
            eventType,
            userId,
            timestamp: new Date(),
            metadata: metadata || {}
        };

        // Add to 'analytics_events' collection
        await db.collection('analytics_events').add(eventData);

        res.status(201).json({ message: 'Event logged successfully' });
    } catch (error) {
        console.error('Error logging analytics event:', error);
        res.status(500).json({ error: 'Failed to log event' });
    }
};

// Get aggregated dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // In a real production app with massive data, we would use aggregation queries or a separate analytics DB.
        // For this MVP, we will fetch recent events and aggregate in memory or use basic Firestore counts.

        // 1. Funnel Stats (Views -> Quotes -> Leads)
        // We'll look at counts for specific event types
        const eventsRef = db.collection('analytics_events');

        // Helper to get count by event type
        const getCount = async (type) => {
            const snapshot = await eventsRef.where('eventType', '==', type).count().get();
            return snapshot.data().count;
        };

        const views = await getCount('view_product');
        const quotes = await getCount('generate_quote');
        const leads = await getCount('convert_lead'); // Assuming this event is logged when a user contacts a vendor

        // 2. Category Popularity
        // We need to fetch 'generate_quote' events and group by metadata.category
        // Note: Firestore doesn't support GROUP BY natively. We'll fetch the last 1000 quotes for approximation.
        const quotesSnapshot = await eventsRef
            .where('eventType', '==', 'generate_quote')
            .orderBy('timestamp', 'desc')
            .limit(1000)
            .get();

        const categoryCounts = {};
        quotesSnapshot.forEach(doc => {
            const data = doc.data();
            const category = data.metadata?.category || 'Unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // Format for frontend chart
        const categoryStats = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

        // 3. User Growth (New Users this month)
        // We can check the 'users' collection
        const usersRef = db.collection('users');
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newUsersSnapshot = await usersRef
            .where('createdAt', '>=', firstDayOfMonth.toISOString()) // Assuming createdAt is stored as ISO string or timestamp
            .count()
            .get();

        const newUsersCount = newUsersSnapshot.data().count;

        // 4. Total Revenue (Estimated from leads * average value, or actual payments)
        // Let's use actual payments from 'payments' collection if available, or just return the lead count for now.
        // The frontend already fetches revenue, so we might just supplement that.

        res.json({
            funnel: {
                views,
                quotes,
                leads
            },
            categoryStats,
            newUsersCount
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
