import mongoose from "mongoose";

export const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    plan: { type: String, required: true }, // string plans like "starter"
    amount: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "rejected"],
      default: "pending",
    },

    dailyInterest: { type: Number, default: 0 },  // fixed daily % or amount
    totalExpected: { type: Number, default: 0 },  // final expected payout
    totalEarned: { type: Number, default: 0 },    // accumulated earnings

    // ✅ add this
    progress: { type: Number, default: 0 }, // percentage 0–100
    durationDays: { type: Number, required: true }, // plan length in days
  },
  { timestamps: true }
);


const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;
