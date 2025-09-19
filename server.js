import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import adminRoutes from "./routes/adminRoute.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import authRoutes from './routes/authRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import { startInvestmentJob } from "./jobs/investmentJob.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import depositRoute from "./routes/depositRoute.js"
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deposit", depositRoute);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))

.catch((err) => console.error("MongoDB connection error:", err));

startInvestmentJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
