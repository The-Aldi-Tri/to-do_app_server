const Joi = require("joi");

const createTaskSchema = Joi.object({
  task: Joi.string().min(3).max(100).required(),
  details: Joi.string().max(350).allow("").required(),
  finished: Joi.boolean().required(),
});

module.exports = { createTaskSchema };
