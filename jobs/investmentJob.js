// jobs/investmentJob.js
import cron from "node-cron";
import User from "../models/User.js";

// Utility: calculate investment progress + earnings
const calculateInvestmentProgress = (investment) => {
  const now = new Date();
  const totalDays = Math.ceil(
    (investment.endDate - investment.startDate) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.min(
    Math.ceil((now - investment.startDate) / (1000 * 60 * 60 * 24)),
    totalDays
  );

  // Progress %
  const progress = Math.min((elapsedDays / totalDays) * 100, 100);

  // Earned so far (before maturity)
  const dailyEarning = (investment.amount * investment.dailyInterest) / 100;
  const earnedSoFar = dailyEarning * elapsedDays;

  return { progress, earnedSoFar, totalDays, elapsedDays };
};

// Daily cron job
export const startInvestmentJob = () => {
  // Runs every midnight server time
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Running daily investment update job...");

    try {
      const users = await User.find();

      for (let user of users) {
        let totalInterest = 0;

        user.investments = user.investments.map((inv) => {
          const { progress, earnedSoFar, totalDays, elapsedDays } =
            calculateInvestmentProgress(inv);

          inv.progress = progress;

          if (elapsedDays >= totalDays && inv.status === "active") {
            // ✅ Investment matured today
            inv.status = "completed";
            inv.progress = 100;

            // Add full totalReturn to balance
            user.balance += inv.totalReturn;

            totalInterest += inv.totalReturn; // reflect in interestWallet too
          } else if (inv.status === "active") {
            // Still running, just add earnings so far
            totalInterest += earnedSoFar;
          } else if (inv.status === "completed") {
            // Completed investments stay locked at totalReturn
            totalInterest += inv.totalReturn;
          }

          return inv;
        });

        // Update interestWallet (reflects total earnings from all investments)
        user.interestWallet = totalInterest;

        await user.save();
      }

      console.log("✅ Investment update job completed");
    } catch (err) {
      console.error("❌ Error in investment cron job:", err.message);
    }
  });
};
