import mongoose from "mongoose";
import { investmentSchema } from "./Investments.js"; // if Investment.js exports it

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

  admin: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  verificationToken: String,

  // Wallet and dashboard tracking
  balance: { type: Number, default: 0 },
  interestWallet: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  pendingDeposit: { type: Number, default: 0 },
  totalWithdrawal: { type: Number, default: 0 },
  rejectedWithdrawal: { type: Number, default: 0 },

  // KYC details
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
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    submittedAt: Date
  },

  // Multiple investments
  investments: [investmentSchema],

}, { timestamps: true });

// ✅ Create and export model
const User = mongoose.model("User", userSchema);
export default User;
