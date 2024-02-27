const rateLimit = require("express-rate-limit");
const {
  tokenTypes,
} = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/config/tokens");
const ApiError = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/ApiError");
const httpStatus = require("http-status");
const constants = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/constants");
const jwt = require("jsonwebtoken");

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1 * 1000, // 1 minute
  max: 10, // Request limit per windowMs
  message: "Too Many Requests, Please Try Again.",
  keyGenerator: function (req) {
    // Generate a unique key based on the combination of user IP and user ID
    const ip = req.ip;
    const userId = getUserIdFromToken(req.headers.authorization);

    return `${userId}:${ip}`;
  },
});

// Extract user id from request
function getUserIdFromToken(authorizationHeader) {
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    const token = authorizationHeader.slice(7);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (payload.type !== tokenTypes.ACCESS) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          JSON.stringify({
            status: false,
            type: constants.SYSTEM,
            error: {
              message: "Token is Invalid",
            },
          })
        );
      }

      return payload.sub;
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        JSON.stringify({
          status: false,
          type: constants.SYSTEM,
          error: {
            message: "Token is Invalid",
          },
        })
      );
    }
  } else {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      JSON.stringify({
        status: false,
        type: constants.SYSTEM,
        error: {
          message: "Token is Required",
        },
      })
    );
  }
}

module.exports = limiter;
