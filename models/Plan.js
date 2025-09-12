import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minDeposit: { type: Number, required: true },
    maxDeposit: { type: Number, required: true },
    durationDays: { type: Number, required: true }, // e.g. 14 or 30
    totalReturn: { type: Number, required: true }, // e.g. 180% (final ROI)
    dailyReturn: { type: Number, required: true }, // e.g. 6.23%
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
