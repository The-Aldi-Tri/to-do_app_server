const Joi = require("joi");

const usernameSchema = Joi.string().alphanum().min(3).max(50);
const emailSchema = Joi.string().email();
const passwordSchema = Joi.string()
  .alphanum()
  .min(8)
  .max(128)
  .pattern(new RegExp("(?=.*[a-z])"))
  .message("{#label} must contain at least one lowercase letter")
  .pattern(new RegExp("(?=.*[A-Z])"))
  .message("{#label} must contain at least one uppercase letter")
  .pattern(new RegExp("(?=.*[0-9])"))
  .message("{#label} must contain at least one number");

const registerSchema = Joi.object({
  username: usernameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
  confirm_password: Joi.valid(Joi.ref("password")).required().messages({
    "any.only": "confirm password must match password",
  }),
});

const loginSchema = Joi.object({
  email_or_username: Joi.alternatives().conditional(Joi.string().pattern(/@/), {
    then: emailSchema.required(),
    otherwise: usernameSchema.required(),
  }),
  password: passwordSchema.required(),
  remember_me: Joi.boolean().required(),
});

const changePasswordSchema = Joi.object({
  current_password: passwordSchema.required(),
  new_password: passwordSchema
    .not(Joi.ref("current_password"))
    .required()
    .messages({
      "any.invalid": "new password must be different from current password",
    }),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
