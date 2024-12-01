const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
});

// userSchema.post('save', function(err,doc,next) {

//   next();
// });

// Create user model
const User = mongoose.model("User", userSchema);

module.exports = User;
