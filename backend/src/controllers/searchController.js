const { admin, db } = require('../config/firebase');
const axios = require('axios');

// Simple fuzzy match function (Levenshtein-based similarity)
function fuzzyMatch(query, text) {
    if (!query || !text) return 0;

    query = query.toLowerCase();
    text = text.toLowerCase();

    // Exact match
    if (text.includes(query)) return 100;

    // Calculate similarity score (simple version)
    const words = query.split(' ');
    let score = 0;
    for (const word of words) {
        if (text.includes(word)) {
            score += (word.length / query.length) * 100;
        }
    }

    return Math.min(100, score);
}

exports.unifiedSearch = async (req, res) => {
    try {
        const { query, filters = { type: 'all' } } = req.body;
        const userId = req.user?.uid; // Optional user ID from auth middleware

        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const searchQuery = query.trim();
        const results = {
            vendors: [],
            products: []
        };

        // Search Vendors (if type is 'all' or 'vendors')
        if (filters.type === 'all' || filters.type === 'vendors') {
            const vendorsSnapshot = await db.collection('users')
                .where('role', '==', 'vendor')
                .where('status', '==', 'approved')
                .get();

            vendorsSnapshot.forEach(doc => {
                const vendor = { id: doc.id, ...doc.data() };
                const score = fuzzyMatch(searchQuery, vendor.companyName || '');

                // Debug log for specific vendor
                if (vendor.companyName && vendor.companyName.toLowerCase().includes('blanc')) {
                    console.log(`DEBUG: Found vendor 'Blanc'. Score: ${score}, Query: ${searchQuery}`);
                }

                if (score > 30) { // Threshold for relevance
                    results.vendors.push({
                        id: vendor.id,
                        companyName: vendor.companyName,
                        address: vendor.address,
                        email: vendor.email,
                        phone: vendor.phone,
                        score
                    });
                }
            });

            // Sort by relevance
            results.vendors.sort((a, b) => b.score - a.score);
            results.vendors = results.vendors.slice(0, 10); // Limit results
        }

        // Search Products (if type is 'all' or 'products')
        if (filters.type === 'all' || filters.type === 'products') {
            const productsSnapshot = await db.collection('insurance_products')
                .where('status', '==', 'Active')
                .get();

            const productMatches = [];
            productsSnapshot.forEach(doc => {
                const product = { id: doc.id, ...doc.data() };
                const nameScore = fuzzyMatch(searchQuery, product.name || '');
                const catScore = fuzzyMatch(searchQuery, product.category || '');
                const score = Math.max(nameScore, catScore * 0.7); // Category match worth less

                if (score > 30) {
                    productMatches.push({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        premium: product.premium,
                        description: product.description,
                        requirements: product.requirements || [],
                        vendorId: product.vendorId,
                        score
                    });
                }
            });

            // Sort by relevance
            productMatches.sort((a, b) => b.score - a.score);
            const topProducts = productMatches.slice(0, 20);

            // Get AI compatibility scores if user is authenticated
            if (userId && topProducts.length > 0) {
                try {
                    // Fetch user profile
                    const userDoc = await db.collection('users').doc(userId).get();
                    const userProfile = userDoc.data();

                    // Call AI service for compatibility scoring
                    const aiResponse = await axios.post('http://localhost:8000/compatibility', {
                        user_profile: {
                            age: userProfile?.age || 'N/A',
                            income: userProfile?.income || 'N/A',
                            budget: userProfile?.budget || 'N/A',
                            dependents: userProfile?.dependents || '0',
                            category: userProfile?.category || 'General',
                            location: userProfile?.location || 'N/A'
                        },
                        products: topProducts.map(p => ({
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            premium: p.premium,
                            description: p.description,
                            requirements: p.requirements
                        }))
                    });

                    const scoredProducts = aiResponse.data.scored_products || [];

                    // Merge compatibility scores with products
                    results.products = topProducts.map(product => {
                        const aiScore = scoredProducts.find(s => s.product_id === product.id);
                        return {
                            ...product,
                            compatibilityScore: aiScore?.score || null,
                            compatibilityReason: aiScore?.reasoning || null
                        };
                    });
                } catch (aiError) {
                    console.error('Error getting AI compatibility scores:', aiError);
                    // Return products without compatibility scores
                    results.products = topProducts;
                }
            } else {
                // No user auth - return products without compatibility
                results.products = topProducts;
            }
        }

        // Debug log the results before sending
        console.log('DEBUG: Returning search results:', {
            vendorCount: results.vendors.length,
            productCount: results.products.length,
            vendors: results.vendors.map(v => ({ name: v.companyName, score: v.score }))
        });

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
};
