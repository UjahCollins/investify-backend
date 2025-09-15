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

// // Create Investment
// export const createInvestment = async (req, res) => {
//   try {
//     const { userId, plan, amount } = req.body;

//     const selectedPlan = investmentPlans[plan];
//     if (!selectedPlan) {
//       return res.status(400).json({ message: "Invalid plan selected" });
//     }

//     if (amount < selectedPlan.minDeposit || amount > selectedPlan.maxDeposit) {
//       return res.status(400).json({ message: "Amount not within plan limits" });
//     }

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // add to pendingDeposit
//     user.pendingDeposit += amount;

//     // prepare investment but mark as "pending"
//     const endDate = new Date();
//     endDate.setDate(endDate.getDate() + selectedPlan.durationDays);

//     const newInvestment = {
//       plan,
//       amount,
//       startDate: new Date(),
//       endDate,
//       dailyInterest: selectedPlan.dailyInterestPercent,
//       totalReturn: (amount * selectedPlan.totalInterestPercent) / 100,
//       progress: 0,
//       status: "pending" // 🆕 field
//     };

//     user.investments.push(newInvestment);
//     await user.save();

//     res.status(201).json({
//       message: "Investment created and awaiting approval",
//       investment: newInvestment,
//       pendingDeposit: user.pendingDeposit
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// Create Investment
// controllers/investmentController.js
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

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.durationDays);

    const newInvestment = {
      plan,
      amount,
      startDate: null, // not started yet
      endDate,
      dailyInterest: selectedPlan.dailyInterestPercent,
      totalReturn: (amount * selectedPlan.totalInterestPercent) / 100,
      progress: 0,
      status: "pending" // NEW
    };

    // Add to investments
    user.investments.push(newInvestment);

    // Add to pendingDeposit
    user.pendingDeposit += amount;

    await user.save();

    res.status(201).json({
      message: "Investment created (pending approval)",
      investment: newInvestment,
      pendingDeposit: user.pendingDeposit
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
