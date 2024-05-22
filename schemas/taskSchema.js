const Joi = require("joi");

const taskSchema = Joi.string().min(3).messages({
  "string.min": "Task must be at least 3 characters",
});

const detailsSchema = Joi.string();

const finishedSchema = Joi.boolean().messages({
  "boolean.base": "Finished must be true or false",
});

const usernameSchema = Joi.string().alphanum().min(3).max(30).messages({
  "string.alphanum": "Username must contain only alphanumeric characters",
  "string.min": "Username must be at least 3 characters",
  "string.max": "Username must be at max 30 characters",
});

const createdAtSchema = Joi.string()
  .pattern(
    /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01]) (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9] WIB$/
  )
  .messages({ "string.pattern.base": "Invalid date/time format" });
// ^: Asserts the start of the string.
// \d{4}: Matches exactly four digits, representing the year.
// \/: Matches the forward slash character /.
// (0[1-9]|1[0-2]): This is a non-capturing group (?: ... ) matching the month. It consists of two alternatives separated by |. The first alternative 0[1-9] matches the months from "01" to "09", and the second alternative 1[0-2] matches the months from "10" to "12".
// \/: Matches another forward slash character /.
// (0[1-9]|[12][0-9]|3[01]): This is a non-capturing group matching the day. Similarly, it consists of three alternatives separated by |. The first alternative 0[1-9] matches the days from "01" to "09", the second alternative [12][0-9] matches the days from "10" to "29" (for months with 30 days), and the third alternative 3[01] matches the days "30" and "31" (for months with 31 days).
// : Matches a space character.
// (?:[01][0-9]|2[0-3]): This is a non-capturing group matching the hour. It consists of two alternatives separated by |. The first alternative [01][0-9] matches the hours from "00" to "19", and the second alternative 2[0-3] matches the hours from "20" to "23".
// :: Matches the colon character :.
// [0-5][0-9]: Matches minutes and seconds. [0-5] matches any digit from 0 to 5, and [0-9] matches any digit from 0 to 9. So, this part matches minutes and seconds from "00" to "59".
// : Matches a space character.
// WIB: Matches the timezone "WIB".
// $: Asserts the end of the string.

const createTaskSchema = Joi.object({
  createdAt: createdAtSchema
    .required()
    .messages({ "any.required": "CreatedAt is required" }),
  task: taskSchema.required().messages({ "any.required": "Task is required" }),
  details: detailsSchema,
  finished: finishedSchema,
});

module.exports = { createTaskSchema };
