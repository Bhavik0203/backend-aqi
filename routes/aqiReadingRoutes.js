const express = require('express');
const router = express.Router();
const aqiReadingController = require('../controllers/aqiReadingController');

router.get('/', aqiReadingController.getAllReadings);
router.get('/:id', aqiReadingController.getReadingById);
router.get('/kit/:kitId/latest', aqiReadingController.getLatestReading);
router.post('/', aqiReadingController.createReading);
router.post('/bulk', aqiReadingController.bulkCreateReadings);
router.delete('/:id', aqiReadingController.deleteReading);

module.exports = router;

