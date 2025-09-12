// utils/updateInvestments.js
export const updateInvestments = (user) => {
  const now = new Date();

  user.investments.forEach((inv) => {
    if (inv.status === "active") {
      const totalDays =
        (inv.endDate - inv.startDate) / (1000 * 60 * 60 * 24); // total duration
      const elapsedDays =
        (now - inv.startDate) / (1000 * 60 * 60 * 24); // how many days passed

      // Progress percentage
      let progress = Math.min((elapsedDays / totalDays) * 100, 100);
      inv.progress = progress;

      // Daily interest accrual
      const earned = Math.min(elapsedDays, totalDays) * (inv.amount * inv.dailyInterest / 100);

      // Sync with interestWallet
      if (earned > 0) {
        user.interestWallet = earned; // 👈 or += if you want accumulation
      }

      // Mark completed if fully matured
      if (progress >= 100) {
        inv.status = "completed";
      }
    }
  });

  return user;
};
