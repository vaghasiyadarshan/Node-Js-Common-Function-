const rateLimit = require('express-rate-limit');

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1 * 1000, // 1 minute
  max: 10, // Request limit per windowMs
  message: 'Too Many Requests, Please Try Again.',
  keyGenerator: function (req) {
    // Generate a unique key based on the combination of user IP
    const ip = req.ip;

    return ip;
  },
});

module.exports = limiter;
