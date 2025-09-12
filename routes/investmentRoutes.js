// routes/investmentRoutes.js
import express from "express";
import { createInvestment, getUserInvestments } from "../controllers/investmentController.js";

const router = express.Router();

router.post("/", createInvestment); // create new investment
router.get("/:userId", getUserInvestments); // get investments by user

export default router;
