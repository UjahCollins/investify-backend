// routes/adminRoutes.js
import express from "express";
import { confirmDeposit } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only admins can confirm deposits
router.post("/confirm-deposit", protect, adminOnly, confirmDeposit);

export default router;
