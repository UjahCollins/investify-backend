// controllers/depositController.js
import User from "../models/User.js";
import multer from "multer";



// controllers/depositController.js
export const depositFunds = async (req, res) => {
  try {
    const { userId, amount, gateway } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Deposit amount must be greater than 0" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add to pending deposit
    user.pendingDeposit += amount;

    // Create transaction
    const transaction = {
      type: "deposit",
      amount,
      gateway: gateway || "N/A",
      date: new Date(),
      status: "pending",
    };

    user.transactions.push(transaction);
    await user.save();

    // Return the transactionId (_id of subdoc)
    const createdTx = user.transactions[user.transactions.length - 1];

    res.status(200).json({
      message: "Deposit created and awaiting admin approval",
      pendingDeposit: user.pendingDeposit,
      transactionId: createdTx._id,   // 👈 important
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/proofs/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

// Upload proof of deposit
export const uploadDepositProof = async (req, res) => {
  try {
    const { userId, username } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add proof record
    user.transactions.push({
      type: "deposit-proof",
      username,
      filePath: req.file.path,
      date: new Date(),
      status: "submitted",
    });

    await user.save();

    res.status(200).json({
      message: "Deposit proof uploaded successfully",
      filePath: req.file.path,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// controllers/depositController.js

export const approveDeposit = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.pendingDeposit < amount) {
      return res.status(400).json({ message: "Not enough pending deposit to approve" });
    }

    // Move from pendingDeposit → depositWallet
    user.pendingDeposit -= amount;
    user.depositWallet += amount;

    // Update transaction history
    const tx = user.transactions.find(
      (t) => t.type === "deposit" && t.amount === amount && t.status === "pending"
    );
    if (tx) tx.status = "approved";

    await user.save();

    res.status(200).json({
      message: "Deposit approved successfully",
      depositWallet: user.depositWallet,
      pendingDeposit: user.pendingDeposit
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
