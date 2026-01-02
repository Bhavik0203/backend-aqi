const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');

router.get('/', userProfileController.getAllProfiles);
router.get('/:id', userProfileController.getProfileById);
router.get('/user/:userId', userProfileController.getProfileByUserId);
router.post('/', userProfileController.createProfile);
router.put('/:id', userProfileController.updateProfile);
router.delete('/:id', userProfileController.deleteProfile);

module.exports = router;

