// jobs/investmentJob.js
import cron from "node-cron";
import User from "../models/User.js";
import Investment from "../models/Investments.js";

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

  // Total return at maturity
  const totalReturn = dailyEarning * totalDays;

  return { progress, earnedSoFar, totalDays, elapsedDays, totalReturn };
};


export const startInvestmentJob = () => {
  // Run every day at midnight
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running daily investment job...");

    const investments = await Investment.find({
      status: { $in: ["active", "pending"] }
    });

    for (let inv of investments) {
      const now = new Date();

      // ✅ If still pending, check if it should activate
      if (inv.status === "pending" && inv.startDate <= now) {
        inv.status = "active";
      }

      // ✅ If active, update progress + earnings
      if (inv.status === "active") {
        const elapsed = Math.floor(
          (now - inv.startDate) / (1000 * 60 * 60 * 24)
        );

        // Progress calculation
        if (inv.durationDays) {
          inv.progress = Math.min((elapsed / inv.durationDays) * 100, 100);
        }

        // Earnings calculation
        const dailyEarnings = (inv.amount * inv.dailyInterest) / 100;
        inv.totalEarned = Math.min(
          dailyEarnings * elapsed,
          inv.totalExpected
        );

        // Complete investment if matured
        if (inv.progress >= 100 || now >= inv.endDate) {
          inv.status = "completed";
          inv.progress = 100;
          inv.totalEarned = inv.totalExpected;
        }
      }

      await inv.save();
    }

    console.log("✅ Investment job finished");
  });
};

