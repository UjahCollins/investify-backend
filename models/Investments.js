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
    dailyInterest: { type: Number, default: 0 },
    totalExpected: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;
