// controllers/investmentController.js
import User from "../models/User.js";
import investmentPlans from "../confiq/investmentPlans.js";

// Utility: calculate progress + earnings
const calculateInvestmentProgress = (investment) => {
  const now = new Date();
  const totalDays = Math.ceil(
    (investment.endDate - investment.startDate) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.min(
    Math.ceil((now - investment.startDate) / (1000 * 60 * 60 * 24)),
    totalDays
  );

  // Progress %
  const progress = Math.min((elapsedDays / totalDays) * 100, 100);

  // Earned so far
  const dailyEarning = (investment.amount * investment.dailyInterest) / 100;
  const earnedSoFar = dailyEarning * elapsedDays;

  return { progress, earnedSoFar };
};

export const createInvestment = async (req, res) => {
  try {
    const { userId, plan, amount } = req.body;

    const selectedPlan = investmentPlans[plan];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    if (amount < selectedPlan.minDeposit || amount > selectedPlan.maxDeposit) {
      return res.status(400).json({ message: "Amount not within plan limits" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Check if user has enough balance in depositWallet
    if (user.depositWallet < amount) {
      return res.status(400).json({ message: "Insufficient balance in deposit wallet" });
    }

    // Deduct from depositWallet
    user.depositWallet -= amount;

    // Set investment dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.durationDays);

    // Create active investment
    const newInvestment = {
      plan,
      amount,
      startDate,
      endDate,
      durationDays: selectedPlan.durationDays, // ✅ fix here
      dailyInterest: selectedPlan.dailyInterestPercent,
      totalReturn: (amount * selectedPlan.totalInterestPercent) / 100,
      progress: 0,
      status: "active"
    };

    user.investments.push(newInvestment);

    await user.save();

    res.status(201).json({
      message: "Investment created successfully",
      investment: newInvestment,
      depositWallet: user.depositWallet
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Get all investments (with recalculated progress + earnings)
export const getUserInvestments = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let totalInterest = 0;

    // Update each investment progress + earnings
    user.investments = user.investments.map((inv) => {
      const { progress, earnedSoFar } = calculateInvestmentProgress(inv);
      inv.progress = progress;
      totalInterest += earnedSoFar;
      return inv;
    });

    // overwrite interestWallet with recalculated value
    user.interestWallet = totalInterest;

    await user.save();

    res.status(200).json({
      investments: user.investments,
      interestWallet: user.interestWallet
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
