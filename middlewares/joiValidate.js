const joiValidate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: process.env.NODE_ENV === "production", // if true: Report all errors (not stop after first error)
        stripUnknown: true, // Strip unknown properties
      });
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = joiValidate;
