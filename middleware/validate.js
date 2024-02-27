const Joi = require("joi");
const httpStatus = require("http-status");
const pick = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/pick");
const constants = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/constants");
const CustomResponse = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/CustomResponse");

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({
      errors: { label: "key", wrap: { label: false } },
      stripUnknown: false,
      abortEarly: false,
    })
    .messages({
      "string.empty": "{#label} is required",
    })
    .validate(object);

  if (error) {
    const { details } = error;

    let response_body = {
      status: false,
      type: constants.VALIDATION,
      error: {},
    };

    /**
     * Create Object of Errors
     *
     * e.g. { email: "email is required" }
     */
    details.filter((item) => {
      response_body.error[item.path.slice(1).join(".")] = item.message;
    });
    // const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new CustomResponse(httpStatus.OK, response_body));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
