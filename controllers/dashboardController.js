import User from "../models/User.js";

// Get dashboard stats for a user
export const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "totalDeposit pendingDeposit totalWithdrawal rejectedWithdrawal interestWallet investments balance"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Last deposit (take from pendingDeposit or history later if you keep a deposit model)
    const lastDeposit = user.totalDeposit > 0 ? user.totalDeposit : 0;

    // Last investment (most recent by startDate)
    const lastInvestment = user.investments.length
      ? user.investments[user.investments.length - 1]
      : null;

    // Scheduled investments = active ones
    const scheduledInvestments = user.investments.filter(
      (inv) => inv.status === "active"
    );

    // Progress bar (average progress of active investments)
    const avgProgress =
      scheduledInvestments.length > 0
        ? (
            scheduledInvestments.reduce((acc, inv) => acc + inv.progress, 0) /
            scheduledInvestments.length
          ).toFixed(2)
        : 0;

    // Latest transaction (last created investment as placeholder — later link with deposit/withdrawal models)
    const latestTransaction = lastInvestment;

    res.status(200).json({
      totalDeposit: user.totalDeposit,
      pendingDeposit: user.pendingDeposit,
      totalWithdrawal: user.totalWithdrawal,
      rejectedWithdrawal: user.rejectedWithdrawal,
      interestWallet: user.interestWallet,
      lastDeposit,
      lastInvestment,
      latestTransaction,
      scheduledInvestments,
      avgProgress,
      balance: user.balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
