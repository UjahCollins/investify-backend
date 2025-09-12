// config/investmentPlans.js
const investmentPlans = {
  starter: {
    name: "Starter Plan",
    minDeposit: 5000,
    maxDeposit: 14999,
    durationDays: 14,
    totalInterestPercent: 180, // total after 14 days
    dailyInterestPercent: 6.23,
  },
  premium: {
    name: "Premium Plan",
    minDeposit: 15000,
    maxDeposit: 24999,
    durationDays: 30,
    totalInterestPercent: 201,
    dailyInterestPercent: 6.7,
  },
  enterprise: {
    name: "Enterprise Plan",
    minDeposit: 25000,
    maxDeposit: 49999,
    durationDays: 30,
    totalInterestPercent: 310,
    dailyInterestPercent: 10.63,
  },
  pro: {
    name: "Pro Plan",
    minDeposit: 50000,
    maxDeposit: 99999,
    durationDays: 30,
    totalInterestPercent: 429,
    dailyInterestPercent: 15.06,
  },
  ultimate: {
    name: "Ultimate Plan",
    minDeposit: 100000,
    maxDeposit: 500000,
    durationDays: 30,
    totalInterestPercent: 500,
    dailyInterestPercent: 20.16,
  },
};

export default investmentPlans;
