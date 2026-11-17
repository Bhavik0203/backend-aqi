const express = require('express');
const router = express.Router();
const { seedAll } = require('../utils/seedAll');

const handleSeed = async (req, res) => {
  try {
    const result = await seedAll();
    res.json({
      success: true,
      message: 'Database seeded successfully with all dummy data!',
      credentials: {
        admin: {
          email: 'admin@pritomatic.com',
          password: 'Pritomatic@123',
          role: 'Administrator'
        },
        technician: {
          email: 'john.doe@pritomatic.com',
          password: 'Pritomatic@123',
          role: 'Technician'
        },
        business: {
          email: 'emily.d@govt.in',
          password: 'Pritomatic@123',
          role: 'Business/Government User'
        },
        public: {
          email: 'michael.w@public.com',
          password: 'Pritomatic@123',
          role: 'Public User'
        }
      },
      summary: result.summary
    });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed: ' + error.message
    });
  }
};

router.get('/', handleSeed);
router.post('/', handleSeed);

module.exports = router;
