const rateLimiter = require('../utils/rateLimiter');
const { MESSAGES } = require('../constants');

const rateLimitMiddleware = async (ctx, next) => {
    if (!ctx.from) {
        return next();
    }

    if (ctx.chat?.id.toString() === process.env.ADMIN_GROUP_ID) {
        return next();
    }

    if (rateLimiter.isRateLimited(ctx.from.id)) {
        return;
    }
    return next();
};

module.exports = rateLimitMiddleware; 