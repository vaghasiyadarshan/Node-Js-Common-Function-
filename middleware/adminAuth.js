const passport = require("passport");
const {
  jwtStrategy,
} = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/config/admin/passport");
const httpStatus = require("http-status");
const ApiError = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/ApiError");
const constants = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/constants");

const verifyCallback = (req, resolve, reject) => async (err, admin, info) => {
  if (err || info || !admin) {
    return reject(
      new ApiError(
        httpStatus.UNAUTHORIZED,
        JSON.stringify({
          status: false,
          type: constants.SYSTEM,
          error: {
            message: "Please Authenticate",
          },
        })
      )
    );
  }

  if (!admin.isActive) {
    return reject(
      new ApiError(
        httpStatus.FORBIDDEN,
        JSON.stringify({
          status: false,
          type: constants.SYSTEM,
          error: {
            message: "Your Account is Disabled",
          },
        })
      )
    );
  }

  if (admin.isStaff) {
    return reject(
      new ApiError(
        httpStatus.FORBIDDEN,
        JSON.stringify({
          status: false,
          type: constants.SYSTEM,
          error: {
            message: "Permission Denied",
          },
        })
      )
    );
  }

  req.admin = admin;

  resolve();
};

const adminAuth = () => async (req, res, next) => {
  passport.use("jwt", jwtStrategy);

  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = adminAuth;
