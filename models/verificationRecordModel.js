const mongoose = require("mongoose");

// Define a schema for verification codes with TTL
const verificationRecordSchema = new mongoose.Schema({
  email: String,
  verification_code: String,
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 300 seconds = 5 minutes
});

const VerificationRecord = mongoose.model(
  "verificationRecord",
  verificationRecordSchema
);

module.exports = VerificationRecord;
