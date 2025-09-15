// controllers/adminController.js
import User from "../models/User.js";

/**
 * Confirm a user's deposit
 * @route POST /api/admin/confirm-deposit
 * @access Admin only
 */
export const confirmDeposit = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: "User ID and amount are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user has enough pendingDeposit
    if (user.pendingDeposit < amount) {
      return res.status(400).json({ message: "Insufficient pending deposit" });
    }

    // Update balances
    user.pendingDeposit -= amount;
    user.balance += amount;
    user.totalDeposit += amount;

    await user.save();

    res.status(200).json({
      message: "Deposit confirmed successfully",
      balance: user.balance,
      totalDeposit: user.totalDeposit,
      pendingDeposit: user.pendingDeposit
    });
  } catch (error) {
    console.error("Confirm deposit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/adminController.js
export const approveInvestment = async (req, res) => {
  try {
    const { userId, investmentId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const investment = user.investments.id(investmentId);
    if (!investment) return res.status(404).json({ message: "Investment not found" });

    if (investment.status !== "pending") {
      return res.status(400).json({ message: "Investment already approved or completed" });
    }

    if (user.pendingDeposit < investment.amount) {
      return res.status(400).json({ message: "Insufficient pending deposit" });
    }

    // Deduct from pending deposit
    user.pendingDeposit -= investment.amount;

    // Activate investment
    investment.status = "active";
    investment.startDate = new Date();

    // (Optional) track totalDeposit too
    user.totalDeposit += investment.amount;

    await user.save();

    res.status(200).json({
      message: "Investment approved and started",
      investment,
      pendingDeposit: user.pendingDeposit,
      totalDeposit: user.totalDeposit
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


