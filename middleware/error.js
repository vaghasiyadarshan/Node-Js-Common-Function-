const mongoose = require("mongoose");
const httpStatus = require("http-status");
const config = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/config/config");
const logger = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/config/logger");
const ApiError = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/ApiError");
const CustomResponse = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/CustomResponse");

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.OK
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new CustomResponse(statusCode, message, true, err.stack);
  }

  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, custom_errors } = err;

  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(custom_errors);
};

module.exports = {
  errorConverter,
  errorHandler,
};
