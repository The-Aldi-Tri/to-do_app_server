const joiValidate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Report all errors (not stop after first error)
      stripUnknown: true, // Strip unknown properties
    });
    if (error) {
      const errors = error.details.map((detail) =>
        detail.message.replace(/['"]/g, "").replace(/[_]/g, " ")
      );
      return res.status(422).json({
        status: "FAILED",
        message: "Data validation failed",
        error: errors,
      });
    }
    next();
  };
};

module.exports = joiValidate;
