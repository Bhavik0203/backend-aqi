const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllProfiles = asyncHandler(async (req, res) => {
  const profiles = await db.UserProfile.findAll();
  res.json({ success: true, data: profiles });
});

exports.getProfileById = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  res.json({ success: true, data: profile });
});

exports.getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findOne({ where: { user_id: req.params.userId } });
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  res.json({ success: true, data: profile });
});

exports.createProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.create(req.body);
  res.status(201).json({ success: true, data: profile });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  await profile.update(req.body);
  res.json({ success: true, data: profile });
});

exports.deleteProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  await profile.destroy();
  res.json({ success: true, message: 'Profile deleted successfully' });
});

