const Joi = require('joi');

/**
 * Validates data using a Joi schema.
 *
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @param {Object} data - The data to be validated.
 * @returns {Object} An object with `status` (true if valid, false if not) and `data` or `errors` properties.
 */
const validateData = (schema, data) => {
  const validationResult = Joi.compile(schema)
    .prefs({
      errors: { label: 'key', wrap: { label: false } },
      stripUnknown: false,
      abortEarly: false,
    })
    .messages({
      'string.empty': '{#label} is required',
    })
    .validate(data);

  if (validationResult.error) {
    // Extract validation error details
    const validationErrors = validationResult.error.details.reduce(
      (errors, item) => {
        errors[item.path] = item.message;
        return errors;
      },
      {}
    );

    return {
      status: false,
      errors: validationErrors,
    };
  }

  return {
    status: true,
    data: validationResult.value,
  };
};

module.exports = {
  validateData,
};
