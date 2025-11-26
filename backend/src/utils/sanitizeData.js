/**
 * Data sanitization utilities to remove sensitive fields before sending to frontend
 */

/**
 * Sanitize user object by removing sensitive fields
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object
 */
const sanitizeUser = (user) => {
    if (!user) return null;

    const {
        password,
        internalNotes,
        auth0Id,
        ipAddress,
        ...safeUser
    } = user;

    return safeUser;
};

/**
 * Sanitize array of users
 * @param {Array} users - Array of user objects
 * @returns {Array} Array of sanitized user objects
 */
const sanitizeUsers = (users) => {
    if (!Array.isArray(users)) return [];
    return users.map(sanitizeUser);
};

/**
 * Sanitize product object
 * @param {Object} product - Product object from database
 * @returns {Object} Sanitized product object
 */
const sanitizeProduct = (product) => {
    if (!product) return null;

    const {
        internalCost,
        vendorNotes,
        ...safeProduct
    } = product;

    return safeProduct;
};

/**
 * Sanitize array of products
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of sanitized product objects
 */
const sanitizeProducts = (products) => {
    if (!Array.isArray(products)) return [];
    return products.map(sanitizeProduct);
};

/**
 * Generic sanitizer that removes specified fields
 * @param {Object|Array} data - Data to sanitize
 * @param {Array<string>} fieldsToRemove - Fields to remove
 * @returns {Object|Array} Sanitized data
 */
const sanitizeFields = (data, fieldsToRemove = []) => {
    if (!data) return null;

    if (Array.isArray(data)) {
        return data.map(item => sanitizeFields(item, fieldsToRemove));
    }

    const sanitized = { ...data };
    fieldsToRemove.forEach(field => {
        delete sanitized[field];
    });

    return sanitized;
};

module.exports = {
    sanitizeUser,
    sanitizeUsers,
    sanitizeProduct,
    sanitizeProducts,
    sanitizeFields
};
