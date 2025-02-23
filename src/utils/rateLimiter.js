const { RATE_LIMIT } = require('../constants');

class RateLimiter {
    constructor(windowMs = RATE_LIMIT.WINDOW_MS, maxRequests = RATE_LIMIT.MAX_REQUESTS) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.requests = new Map();
    }

    isRateLimited(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        
        // Entferne alte Anfragen
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (validRequests.length >= this.maxRequests) {
            return true;
        }
        
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return false;
    }
}

const globalRateLimiter = new RateLimiter();

module.exports = globalRateLimiter; 