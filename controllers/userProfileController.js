const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

// Get all user profiles
exports.getAllProfiles = asyncHandler(async (req, res) => {
  const profiles = await db.UserProfile.findAll();
  res.json({ success: true, data: profiles });
});

// Get profile by ID
exports.getProfileById = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  res.json({ success: true, data: profile });
});

// Get profile by user_id
exports.getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findOne({ where: { user_id: req.params.userId } });
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  res.json({ success: true, data: profile });
});

// Create new profile
exports.createProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.create(req.body);
  res.status(201).json({ success: true, data: profile });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  await profile.update(req.body);
  res.json({ success: true, data: profile });
});

// Delete profile
exports.deleteProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  await profile.destroy();
  res.json({ success: true, message: 'Profile deleted successfully' });
});

