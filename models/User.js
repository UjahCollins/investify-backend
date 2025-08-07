const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: String,
  phone: String,
  firstName: String,
  lastName: String,
  address: String,
  zipCode: String,
  city: String,
  verified: { type: Boolean, default: false },
  verificationToken: String,
  kyc: {
    fullName: String,
    gender: String,
    dob: Date,
    ssn: String,
    occupation: String,
    licenseFront: String,
    licenseBack: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
