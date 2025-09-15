// routes/adminRoutes.js
import express from "express";
import { confirmDeposit, approveInvestment } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only admins can confirm deposits
router.post("/confirm-deposit", protect, adminOnly, confirmDeposit);
router.post("/confirm-investment", protect, adminOnly, approveInvestment);

export default router;
