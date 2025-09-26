// routes/withdrawRoutes.js
import express from "express";
import {
  withdrawMoney,
  acceptWithdrawal,
  rejectWithdrawal,
  getWithdrawalRequests,
  getUserPendingWithdrawals,
} from "../controllers/withdrawController.js";

const router = express.Router();

router.post("/withdrawMoney/:id", withdrawMoney);
router.post("/acceptWithdrawal", acceptWithdrawal);
router.post("/rejectWithdrawal", rejectWithdrawal);
router.get("/getWithdrawalRequests", getWithdrawalRequests);
router.get("/getUserPendingWithdrawals/:id", getUserPendingWithdrawals);

export default router;
