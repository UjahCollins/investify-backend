import express from 'express';
import User from '../models/User.js';
import upload from '../middlewares/uploads.js';

const router = express.Router();

router.post('/:userId/submit', upload.fields([
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 }
]), async (req, res) => {
  const { userId } = req.params;
  const { fullName, gender, dob, ssn, occupation } = req.body;

  if (!req.files.licenseFront || !req.files.licenseBack) {
    return res.status(400).json({ message: 'Both license images are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.kyc = {
      fullName,
      gender,
      dob,
      ssn,
      occupation,
      licenseFront: req.files.licenseFront[0].path,
      licenseBack: req.files.licenseBack[0].path,
      status: 'pending',
      submittedAt: new Date()
    };

    await user.save();
    res.status(200).json({ message: 'KYC submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;   // ✅ ESM export
