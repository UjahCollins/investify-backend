// controllers/adminController.js
import User from "../models/User.js";

/**
 * Confirm a user's deposit
 * @route POST /api/admin/confirm-deposit
 * @access Admin only
 */
// controllers/depositController.js
export const confirmDeposit = async (req, res) => {
  try {
    const { userId, transactionId } = req.body;

    if (!userId || !transactionId) {
      return res.status(400).json({ message: "User ID and transaction ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find transaction by ID
    const transaction = user.transactions.id(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    const amount = transaction.amount;

    // ✅ Update balances (based on your schema)
    if (user.pendingDeposit < amount) {
      return res.status(400).json({ message: "Insufficient pending deposit" });
    }

    user.pendingDeposit -= amount;
    user.depositWallet += amount;
    user.totalDeposit += amount;

    // Update transaction status
    transaction.status = "approved";

    await user.save();

    res.status(200).json({
      message: "Deposit confirmed successfully",
      depositWallet: user.depositWallet,
      totalDeposit: user.totalDeposit,
      pendingDeposit: user.pendingDeposit,
      transaction,
    });
  } catch (error) {
    console.error("Confirm deposit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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




