const Joi = require("joi");

const usernameSchema = Joi.string().alphanum().min(3).max(30).messages({
  "string.alphanum": "Username must contain only alphanumeric characters",
  "string.min": "Username must be at least 3 characters",
  "string.max": "Username must be at max 30 characters",
});

const emailSchema = Joi.string().email().messages({
  "string.email": "Invalid email address",
});

const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])"))
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 30 characters",
    "string.pattern.base":
      "Password must contain at least one lowercase letter and one uppercase letter",
  });

const registerSchema = Joi.object({
  username: usernameSchema
    .required()
    .messages({ "any.required": "Username is required" }),
  email: emailSchema
    .required()
    .messages({ "any.required": "Email is required" }),
  password: passwordSchema
    .required()
    .messages({ "any.required": "Password is required" }),
  rePassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
    "any.required": "Password confirmation is required",
  }),
});

const loginSchema = Joi.object({
  emailOrUsername: Joi.alternatives().conditional(Joi.string().pattern(/@/), {
    then: emailSchema
      .required()
      .messages({ "any.required": "Email is required" }),
    otherwise: usernameSchema
      .required()
      .messages({ "any.required": "Username is required" }),
  }),
  password: passwordSchema
    .required()
    .messages({ "any.required": "Password is required" }),
  rememberMe: Joi.boolean().required().messages({
    "boolean.base": "Remember me must be true or false",
    "any.required": "Remember me is required",
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: passwordSchema
    .required()
    .messages({ "any.required": "Current password is required" }),
  newPassword: passwordSchema
    .not(Joi.ref("currentPassword"))
    .required()
    .messages({
      "any.required": "New password is required",
      "any.not": "New password must be different from current password",
    }),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
