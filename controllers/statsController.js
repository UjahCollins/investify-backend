// controllers/statsController.js
import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Utility helpers to detect whether Deposit/Withdrawal models are registered
 * (useful if you later add dedicated collections). If not present we fall back
 * to values stored on the User document (totalDeposit, pendingDeposit, etc).
 */
const getDepositModel = () =>
  mongoose.modelNames().includes("Deposit") ? mongoose.model("Deposit") : null;
const getWithdrawalModel = () =>
  mongoose.modelNames().includes("Withdrawal")
    ? mongoose.model("Withdrawal")
    : null;

/* --------------------- Deposits --------------------- */

export const getTotalDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const Deposit = getDepositModel();
    if (Deposit) {
      const deposits = await Deposit.find({ user: id, status: "approved" });
      const totalDeposit = deposits.reduce((s, d) => s + (d.amount || 0), 0);
      return res.status(200).json({ totalDeposit });
    }
    const user = await User.findById(id).select("totalDeposit");
    return res.status(200).json({ totalDeposit: user?.totalDeposit ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const Deposit = getDepositModel();
    if (Deposit) {
      const pending = await Deposit.find({ user: id, status: "pending" });
      const pendingDeposit = pending.reduce((s, d) => s + (d.amount || 0), 0);
      return res.status(200).json({ pendingDeposit });
    }
    const user = await User.findById(id).select("pendingDeposit");
    return res.status(200).json({ pendingDeposit: user?.pendingDeposit ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getLastDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const Deposit = getDepositModel();
    if (Deposit) {
      const last = await Deposit.findOne({ user: id, status: "approved" }).sort({ createdAt: -1 });
      return res.status(200).json({ amount: last ? last.amount : 0 });
    }
    // fallback: return 0 if you don't store last deposit on user
    const user = await User.findById(id).select("lastDeposit totalDeposit");
    return res.status(200).json({ amount: user?.lastDeposit ?? user?.totalDeposit ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getRejectedDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const Deposit = getDepositModel();
    if (Deposit) {
      const rej = await Deposit.find({ user: id, status: "rejected" });
      const rejectedDeposit = rej.reduce((s, d) => s + (d.amount || 0), 0);
      return res.status(200).json({ rejectedDeposit });
    }
    const user = await User.findById(id).select("rejectedDeposit");
    return res.status(200).json({ rejectedDeposit: user?.rejectedDeposit ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* --------------------- Withdrawals --------------------- */

export const getTotalWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const Withdrawal = getWithdrawalModel();
    if (Withdrawal) {
      const w = await Withdrawal.find({ user: id, status: "approved" });
      const totalWithdraw = w.reduce((s, tx) => s + (tx.amount || 0), 0);
      return res.status(200).json({ totalWithdraw });
    }
    const user = await User.findById(id).select("totalWithdrawal");
    return res.status(200).json({ totalWithdraw: user?.totalWithdrawal ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingwithdrawl = async (req, res) => {
  try {
    const { id } = req.params;
    const Withdrawal = getWithdrawalModel();
    if (Withdrawal) {
      const pending = await Withdrawal.find({ user: id, status: "pending" });
      const PendingWithdraw = pending.reduce((s, tx) => s + (tx.amount || 0), 0);
      return res.status(200).json({ PendingWithdraw });
    }
    const user = await User.findById(id).select("pendingWithdrawal");
    return res.status(200).json({ PendingWithdraw: user?.pendingWithdrawal ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getRejectedWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const Withdrawal = getWithdrawalModel();
    if (Withdrawal) {
      const rej = await Withdrawal.find({ user: id, status: "rejected" });
      const rejectedWithdraw = rej.reduce((s, tx) => s + (tx.amount || 0), 0);
      return res.status(200).json({ rejectedWithdraw });
    }
    const user = await User.findById(id).select("rejectedWithdrawal");
    return res.status(200).json({ rejectedWithdraw: user?.rejectedWithdrawal ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getLastWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const Withdrawal = getWithdrawalModel();
    if (Withdrawal) {
      const last = await Withdrawal.findOne({ user: id, status: "approved" }).sort({ createdAt: -1 });
      return res.status(200).json({ amount: last ? last.amount : 0 });
    }
    const user = await User.findById(id).select("lastWithdrawal totalWithdrawal");
    return res.status(200).json({ amount: user?.lastWithdrawal ?? user?.totalWithdrawal ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* --------------------- Interest & Investments --------------------- */

export const getUserIntrestWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("interestWallet");
    return res.status(200).json({ intrestWallet: user?.interestWallet ?? 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getLastInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("investments");
    if (!user) return res.status(200).json({ amount: 0 });
    const invs = user.investments || [];
    // last by startDate or createdAt
    const last = invs.length ? invs.slice().sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt))[0] : null;
    return res.status(200).json({ amount: last ? last.amount : 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getRunningInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("investments");
    if (!user) return res.status(200).json({ amount: 0 });
    const running = (user.investments || []).filter(i => i.status === "active" || i.status === "running");
    const amount = running.reduce((s, inv) => s + (inv.amount || 0), 0);
    return res.status(200).json({ amount });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCompletedInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("investments");
    if (!user) return res.status(200).json({ amount: 0 });
    const completed = (user.investments || []).filter(i => i.status === "completed");
    const amount = completed.reduce((s, inv) => s + (inv.amount || 0), 0);
    return res.status(200).json({ amount });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* --------------------- Latest Transaction --------------------- */

export const getLatestTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const Deposit = getDepositModel();
    const Withdrawal = getWithdrawalModel();

    let lastDeposit = null;
    let lastWithdrawal = null;

    if (Deposit) lastDeposit = await Deposit.findOne({ user: id }).sort({ createdAt: -1 });
    if (Withdrawal) lastWithdrawal = await Withdrawal.findOne({ user: id }).sort({ createdAt: -1 });

    let latest = null;

    if (lastDeposit && lastWithdrawal) {
      latest = (lastDeposit.createdAt > lastWithdrawal.createdAt)
        ? { ID: lastDeposit._id, amount: lastDeposit.amount, timestamp: lastDeposit.createdAt, type: "deposit" }
        : { ID: lastWithdrawal._id, amount: lastWithdrawal.amount, timestamp: lastWithdrawal.createdAt, type: "withdrawal" };
    } else if (lastDeposit) {
      latest = { ID: lastDeposit._id, amount: lastDeposit.amount, timestamp: lastDeposit.createdAt, type: "deposit" };
    } else if (lastWithdrawal) {
      latest = { ID: lastWithdrawal._id, amount: lastWithdrawal.amount, timestamp: lastWithdrawal.createdAt, type: "withdrawal" };
    } else {
      // fallback: use investments as "transactions"
      const user = await User.findById(id).select("investments");
      const invs = user?.investments || [];
      if (invs.length) {
        const lastInv = invs.slice().sort((a,b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt))[0];
        latest = { ID: lastInv._id || null, amount: lastInv.amount, timestamp: lastInv.startDate || lastInv.createdAt, type: "investment" };
      } else {
        latest = {};
      }
    }

    return res.status(200).json({ data: latest || {} });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
