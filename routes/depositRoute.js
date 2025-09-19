// routes/depositRoutes.js
import express from "express";
import { 
  depositFunds, 
  approveDeposit, 
  uploadDepositProof, 
  upload 
} from "../controllers/depositController.js";

const router = express.Router();

// Step 1: User creates a deposit (goes to pendingDeposit)
router.post("/create", depositFunds);

// Step 2: Admin approves deposit
router.post("/approve", approveDeposit);

// Step 3: User uploads deposit proof (image)
router.post("/upload-proof", upload.single("proof"), uploadDepositProof);

export default router;
