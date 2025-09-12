// routes/statsRoutes.js
import express from "express";
import * as stats from "../controllers/statsController.js";

const router = express.Router();

// Deposit endpoints (names match your frontend)
router.get("/getTotalDeposit/:id", stats.getTotalDeposit);
router.get("/getPendingDeposit/:id", stats.getPendingDeposit);
router.get("/getLastDeposit/:id", stats.getLastDeposit);
router.get("/RejectedDeposit/:id", stats.getRejectedDeposit);

// Withdraw endpoints
router.get("/getTotalWithdraw/:id", stats.getTotalWithdraw);
router.get("/getPendingwithdrawl/:id", stats.getPendingwithdrawl);
router.get("/RejectedWithdral/:id", stats.getRejectedWithdrawal);
router.get("/getLastWithdrawal/:id", stats.getLastWithdrawal);

// Interest & investments
router.get("/getUserIntrestWallet/:id", stats.getUserIntrestWallet);
router.get("/getLastInvestment/:id", stats.getLastInvestment);
router.get("/getRunningInvestment/:id", stats.getRunningInvestment);
router.get("/getCompletedInvestment/:id", stats.getCompletedInvestment);

// Latest transaction
router.get("/getLatestTransaction/:id", stats.getLatestTransaction);

export default router;
