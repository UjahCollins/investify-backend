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
