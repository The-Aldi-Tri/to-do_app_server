const joiValidate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Report all errors
      stripUnknown: true, // Strip unknown properties
    });
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = joiValidate;
