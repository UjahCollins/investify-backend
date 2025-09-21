import mongoose from "mongoose";
import { investmentSchema } from "./Investments.js"; // if Investment.js exports it

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["deposit", "withdrawal", "investment"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  proof: { type: String }, // optional, for deposit proof
});

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

  referralCode: { type: String, unique: true, sparse: true },

  // Wallet & dashboard
  balance: { type: Number, default: 0 },
  depositWallet: { type: Number, default: 0 },
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

  // ✅ Add transactions array here
  transactions: { type: [transactionSchema], default: [] }

}, { timestamps: true });


// ✅ Create and export model
const User = mongoose.model("User", userSchema);
export default User;
