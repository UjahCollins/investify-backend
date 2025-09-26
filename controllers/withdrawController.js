// controllers/withdrawController.js
import User from "../models/User.js";

export const withdrawMoney = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const {
      method,
      walletName,
      walletAddress,
      bankName,
      accountNumber,
      accountHolderName,
      swiftCode,
      routingNumber,
      amount,
    } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const withdrawAmount = Number(amount);
    if (withdrawAmount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    // ✅ Check if user has enough balance
    if (user.balance < withdrawAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from balance, move to pendingWithdraw
    user.balance -= withdrawAmount;
    user.pendingWithdraw += withdrawAmount;

    // Add transaction
    user.transactions.push({
      type: "withdrawal",
      amount: withdrawAmount,
      date: new Date(),
      status: "pending",
      method,
      walletName,
      walletAddress,
      bankName,
      accountNumber,
      accountHolderName,
      swiftCode,
      routingNumber,
    });

    await user.save();

    res.status(200).json({
      message: "Withdrawal request submitted successfully",
      remainingBalance: user.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptWithdrawal = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the latest pending withdrawal
    const withdrawal = user.transactions
      .slice()
      .reverse()
      .find((tx) => tx.type === "withdrawal" && tx.status === "pending");

    if (!withdrawal) {
      return res.status(400).json({ message: "No pending withdrawal found" });
    }

    // Mark approved
    withdrawal.status = "approved";
    user.pendingWithdraw -= withdrawal.amount;

    await user.save();

    res.status(200).json({ message: "Withdrawal approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectWithdrawal = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the latest pending withdrawal
    const withdrawal = user.transactions
      .slice()
      .reverse()
      .find((tx) => tx.type === "withdrawal" && tx.status === "pending");

    if (!withdrawal) {
      return res.status(400).json({ message: "No pending withdrawal found" });
    }

    // Mark rejected
    withdrawal.status = "rejected";

    // Refund balance
    user.balance += withdrawal.amount;
    user.pendingWithdraw -= withdrawal.amount;

    await user.save();

    res.status(200).json({ message: "Withdrawal rejected and refunded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/withdrawController.js

export const getWithdrawalRequests = async (req, res) => {
  try {
    const users = await User.find({ pendingWithdraw: { $gt: 0 } })
      .select("username email pendingWithdraw transactions");

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserPendingWithdrawals = async (req, res) => {
  try {
    const { id } = req.params; // userId

    const user = await User.findById(id).select("username email pendingWithdraw transactions");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter transactions for pending withdrawals
    const pendingWithdrawals = user.transactions.filter(
      (tx) => tx.type === "withdrawal" && tx.status === "pending"
    );

    res.status(200).json({
      pendingWithdraw: user.pendingWithdraw,
      transactions: pendingWithdrawals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
