const { RATE_LIMIT } = require('../constants'); // Stelle sicher, dass die Konstante geladen wird

class RateLimiter {
    constructor(windowMs = RATE_LIMIT.WINDOW_MS, maxRequests = RATE_LIMIT.MAX_REQUESTS) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.users = new Map();
    }

    isRateLimited(userId) {
        const now = Date.now();
        if (!this.users.has(userId)) {
            this.users.set(userId, { count: 1, startTime: now });
            return false;
        }

        const userData = this.users.get(userId);
        if (now - userData.startTime > this.windowMs) {
            this.users.set(userId, { count: 1, startTime: now });
            return false;
        }

        if (userData.count >= this.maxRequests) {
            return true;
        }

        userData.count++;
        return false;
    }
}

module.exports = new RateLimiter();
