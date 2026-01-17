const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const firebaseAdmin = require('../config/firebase');
const bcrypt = require('bcryptjs');

// FCM Helper
const sendFCMUserNotification = async (profile, title, body) => {
  const payload = {
    notification: { title, body },
    data: {
      user_id: profile.id ? String(profile.id) : '',
      email: profile.email || '',
      type: 'user_alert'
    }
  };
  const TEST_TOKEN = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';
  try {
    await firebaseAdmin.messaging().send({ topic: 'user', ...payload });
    await firebaseAdmin.messaging().send({ token: TEST_TOKEN, ...payload });
    console.log(`✅ FCM User Notification sent: ${title}`);
  } catch (e) {
    console.error('❌ FCM User Notification failed:', e.message);
  }
};

exports.getAllProfiles = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.role_id) where.role_id = req.query.role_id;

  const profiles = await db.UserProfile.findAll({
    where,
    include: [{ model: db.Role, as: 'roleData' }]
  });
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

const emailService = require('../utils/emailService');

// Configure email service with the provided key (In a real app, use ENV variables)
// The user provided '16 digit no ...' which implies they might expect me to use a specific one or placeholders.
// Since I don't have the actual key in the prompt history clearly (except maybe an old one 'atlbybfag'), 
// I will assume the user has set it or I will use a placeholder that they can update.
// For now, I will NOT hardcode a specific key unless I find it. I'll rely on the service default or .env.
// Actually, earlier prompt had `atlbybfag@gmail.com` and a key. This prompt has `bhavikdemos@gmail.com`.
// I will use a placeholder in the code or allow the user to substitute it. 
// Ideally, I should prompt the user, but I must complete the task.
// I will assume the user wants the LOGIC fixed. 

exports.createProfile = asyncHandler(async (req, res) => {
  // Support legacy string role
  let roleId = req.body.role_id;

  if (req.body.role && !roleId) {
    const roleKey = req.body.role.toLowerCase().replace(/\s+/g, '_');
    const role = await db.Role.findOne({
      where: db.Sequelize.or(
        { key: roleKey },
        { label: req.body.role }
      )
    });
    if (role) {
      roleId = role.id;
    }
  }

  if (!roleId) {
    return res.status(400).json({ success: false, message: 'Role is required' });
  }

  // Check for existing user by email
  if (req.body.email) {
    const existingUser = await db.UserProfile.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }
  }

  // Fetch Role to generate password
  const role = await db.Role.findByPk(roleId);
  if (!role) {
    return res.status(400).json({ success: false, message: 'Invalid Role ID' });
  }

  // Generate Auto-Password
  // Format: RoleName@001, RoleName@002...
  const userCount = await db.UserProfile.count({ where: { role_id: roleId } });
  const sequence = String(userCount + 1).padStart(3, '0');
  // Sanitize role label for password (remove spaces?) User example: "Admin@001". 
  // If role is "Site Engineer", maybe "SiteEngineer@001"? 
  // User input "anyrole = Role@001". I'll keep it simple, remove spaces.
  const rolePrefix = role.label.replace(/\s+/g, '');
  const autoPassword = `${rolePrefix}@${sequence}`;

  // Auto-Generate Name ONLY if not provided
  if (!req.body.first_name) {
    req.body.first_name = role.label; // e.g. "Admin"
    req.body.last_name = sequence;    // e.g. "001"
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(autoPassword, salt);

  // Create User
  const userData = {
    ...req.body,
    role_id: roleId,
    password: hashedPassword
  };
  // remove raw 'role' if present
  delete userData.role;

  const profile = await db.UserProfile.create(userData);

  // Trigger Alert
  await db.Alert.create({
    alert_category: 'user',
    alert_description: `New User registered: ${profile.first_name} ${profile.last_name}`,
    alert_status: 'open',
    kit_id: null
  });

  // Send Notification
  sendFCMUserNotification(profile, 'New User', `New user registered: ${profile.first_name} ${profile.last_name}`);

  // Send Email with Credentials
  // NOTE: Pass the raw autoPassword to the email service so the user knows it.
  const emailDetails = {
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    role: role.label,
    password: autoPassword
  };

  // We need to set the password dynamically if provided in environment, or assume service has it.
  // For this specific request, I'll try to use a hardcoded one if I had it, but I don't.
  // I will rely on the emailService having the correct setup or the user editing it.
  await emailService.sendUserCredentialsEmail(profile.email, emailDetails);

  res.status(201).json({ success: true, data: profile });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await db.UserProfile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  // Support legacy string role
  if (req.body.role && !req.body.role_id) {
    const roleKey = req.body.role.toLowerCase().replace(/\s+/g, '_');
    const role = await db.Role.findOne({
      where: db.Sequelize.or(
        { key: roleKey },
        { label: req.body.role }
      )
    });
    if (role) {
      req.body.role_id = role.id;
    }
    delete req.body.role;
  }

  await profile.update(req.body);

  // Alert & Notify
  try {
    await db.Alert.create({
      alert_category: 'user',
      alert_description: `User Profile Updated: ${profile.first_name} ${profile.last_name}`,
      alert_status: 'open',
      kit_id: null
    });
    sendFCMUserNotification(profile, 'User Updated', `Profile updated for ${profile.first_name} ${profile.last_name}`);
  } catch (e) { console.error(e); }

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

