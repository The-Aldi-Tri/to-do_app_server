const mongoose = require("mongoose");

// Check if id are valid object id (_id) in mongoose
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = isValidObjectId;
